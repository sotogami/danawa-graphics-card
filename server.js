const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;
const crypto = require('crypto');


// 사용자 정보를 세션에 저장하는 함수
function saveUserToSession(req, user) {
    req.session.user = {
        user_id: user.user_id,  // user_id 필드 추가
        user_name: user.user_name,
        display_name: user.display_name,
        email: user.email,
        phone: user.phone,
        // 필요한 다른 사용자 정보도 추가할 수 있습니다.
    };
    console.log('User saved to session:', req.session.user);
}


// 랜덤하고 안전한 세션 시크릿 생성
const sessionSecret = crypto.randomBytes(64).toString('hex');
// MySQL 연결 설정 (연결 풀 사용)
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ezHvqEwpdF1UH7yTi1yC',
    database: 'dgbm',
    connectionLimit: 10,
});

// bodyParser를 사용하여 post 요청의 데이터를 파싱
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// express-session 설정
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
}));

// CORS 설정
app.use(cors());

// 정적 파일 제공 (HTML, CSS, 이미지 등)
app.use(express.static('public'));

// 홈페이지 라우팅
app.get('/', (req, res) => {
    // 세션에서 사용자 정보를 가져옵니다.
    const user = req.session.user;

    // 로그인된 경우 메인 페이지를 렌더링합니다.
    if (user) {
        res.sendFile(__dirname + '/public/main_logged_in.html');
    } else {
        // 로그인되지 않은 경우 로그인 페이지를 렌더링합니다.
        res.sendFile(__dirname + '/public/main.html');
    }
});

// 회원가입 처리 라우트 추가
app.post('/user', async (req, res) => {
    const display_name = req.body.display_name;
    const user_name = req.body.user_name;
    const email = req.body.email;
    const phone = req.body.tel1 + req.body.tel;
    const password = req.body.password;

    try {
        // bcrypt를 사용하여 암호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 정보 데이터베이스에 추가
        const sqlInsert = 'INSERT INTO user (user_name, email, phone, password, display_name) VALUES (?, ?, ?, ?, ?)';
        connection.query(sqlInsert, [user_name, email, phone, hashedPassword, display_name], (error, results) => {
            if (error) throw error;
            res.send('회원가입이 완료되었습니다.');
        });
    } catch (error) {
        console.error('암호 해시화 오류:', error);
        res.status(500).send('회원가입 중 오류가 발생했습니다.');
    }
});

// /login 라우트 수정
app.post('/login', async (req, res) => {
    const user_name = req.body.user_name;
    const password = req.body.password;

    console.log('로그인 요청:', { user_name, password });

    // 사용자 정보 데이터베이스에서 확인
    const sqlCheckUser = 'SELECT * FROM user WHERE user_name = ?';
    connection.query(sqlCheckUser, [user_name], async (error, results) => {
        if (error) {
            console.error('사용자 정보 조회 오류:', error);
            return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            const user = results[0];

            // 비밀번호 해시 확인
            try {
                const match = await bcrypt.compare(password, user.password);

                if (match) {
                    // 로그인 성공
                    saveUserToSession(req, user);

                    // 여기서 로그인 후 메인 페이지로 리다이렉트
                    res.json({ success: true, message: '로그인이 완료되었습니다.', user });
                } else {
                    // 비밀번호 불일치
                    res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
                }
            } catch (error) {
                console.error('비밀번호 비교 오류:', error);
                res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
            }
        } else {
            // 사용자가 존재하지 않음
            res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }
    });
});


// 로그아웃 처리 라우트
app.get('/logout', (req, res) => {
    // 세션에서 사용자 정보 삭제
    req.session.destroy((err) => {
        if (err) {
            console.error('세션 삭제 실패:', err);
        }
        res.redirect('/');
    });
});
// 제품들 보여주기
app.get('/getProducts', async (req, res) => {
    try {
        const productsPerPage = 24; // 페이지당 표시할 상품 수
        const page = req.query.page || 1;
        const offset = (page - 1) * productsPerPage;
        let orderBy = 'gpu_id ASC'; // 초기 정렬은 gpu_id

        // sortOrder가 없거나 빈 문자열일 때 초기 정렬을 gpu_id로 설정
        if (req.query.sortOrder && req.query.sortOrder.trim() !== '') {
            orderBy = req.query.sortOrder === 'desc' ? 'price DESC' : 'price ASC';
        }

        console.log('SQL Query:', `SELECT gpu_id, gpu_name, price, image_url FROM products USE INDEX(idx_price) ORDER BY ${orderBy} LIMIT ?, ?`);

        const [products] = await connection.promise().query(
            `SELECT gpu_id, gpu_name, price, image_url FROM products USE INDEX(idx_price) ORDER BY ${orderBy} LIMIT ?, ?`,
            [offset, productsPerPage]
        );

        const [totalProducts] = await connection.promise().query(
            'SELECT COUNT(*) AS count FROM products'
        );
        const totalPages = Math.ceil(totalProducts[0].count / productsPerPage);

        res.json({ products, totalPages });
    } catch (error) {
        console.error('상품 데이터를 가져오는 도중 오류가 발생했습니다.', error);
        res.status(500).json({ error: '내부 서버 오류' });
    }
});

// 제품들 필터링
app.get('/getFilteredProducts', async (req, res) => {
    try {
        const productsPerPage = 24;
        const page = req.query.page || 1;
        const offset = (page - 1) * productsPerPage;
        let orderBy = 'gpu_id ASC';

        if (req.query.sortOrder && req.query.sortOrder.trim() !== '') {
            orderBy = req.query.sortOrder === 'desc' ? 'price DESC' : 'price ASC';
        }

        const addFilterCondition = (filterValues, column) => {
            if (filterValues) {
                const filterConditions = filterValues.split('&');
                const conditions = [];
                const conditionValues = [];
        
                filterConditions.forEach(value => {
                    const condition = `${column} LIKE ?`;
                    const conditionValue = `%${value}%`;
                    conditions.push(condition);
                    conditionValues.push(conditionValue);
                });
        
                if (conditions.length > 0) {
                    whereClauseValues.push(...conditionValues);
                    return { condition: conditions.join(' AND '), conditionValues };
                }
            }
        
            return { condition: '', conditionValues: [] };
        };
        

        const { manufacturers, chipsets, memorySizes } = req.query;
        const whereClauseValues = [];

        const { condition: manufacturerCondition, conditionValues: manufacturerConditionValues } = addFilterCondition(manufacturers, 'gpu_name');
        const { condition: chipsetCondition, conditionValues: chipsetConditionValues } = addFilterCondition(chipsets, 'gpu_name');
        const { condition: memoryCondition, conditionValues: memoryConditionValues } = addFilterCondition(memorySizes, 'gpu_name');
        console.log('Chipset Condition Values:', chipsetConditionValues);
        
        const conditions = [manufacturerCondition, chipsetCondition, memoryCondition].filter(Boolean);
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sqlQuery = `SELECT gpu_id, gpu_name, price, image_url 
            FROM products 
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ?, ?;`;

        console.log('SQL Query:', sqlQuery);
        console.log('Request Query Parameters:', req.query);

        const [products] = await connection.promise().query(sqlQuery, [...whereClauseValues, offset, productsPerPage]);

        const [totalProducts] = await connection.promise().query(`SELECT COUNT(*) AS count FROM products ${whereClause}`, whereClauseValues);

        const totalPages = Math.ceil(totalProducts[0].count / productsPerPage);

        res.json({ products, totalPages });
    } catch (error) {
        console.error('필터링된 상품 데이터를 가져오는 도중 오류가 발생했습니다.', error);
        res.status(500).json({ error: '내부 서버 오류' });
    }
});

// /getProductsByDefault 라우트 추가 - 초기 정렬은 gpu_id
app.get('/getProductsByDefault', async (req, res) => {
    try {
        const productsPerPage = 24; // 페이지당 표시할 상품 수
        const page = req.query.page || 1;
        const offset = (page - 1) * productsPerPage;

        console.log('SQL Query:', 'SELECT gpu_id, gpu_name, price, image_url FROM products USE INDEX(idx_price) ORDER BY gpu_id ASC LIMIT ?, ?');

        const [products] = await connection.promise().query(
            'SELECT gpu_id, gpu_name, price, image_url FROM products USE INDEX(idx_price) ORDER BY gpu_id ASC LIMIT ?, ?',
            [offset, productsPerPage]
        );


        const [totalProducts] = await connection.promise().query(
            'SELECT COUNT(*) AS count FROM products'
        );
        const totalPages = Math.ceil(totalProducts[0].count / productsPerPage);

        res.json({ products, totalPages });
    } catch (error) {
        console.error('기본 정렬로 상품 데이터를 가져오는 도중 오류가 발생했습니다.', error);
        res.status(500).json({ error: '내부 서버 오류' });
    }
});

// 상세페이지 엔드포인트 코드
app.get('/getProductDetail', async (req, res) => {
    const productId = req.query.productId;

    try {
        // 상품 정보 데이터베이스에서 조회
        const [productDetail] = await connection.promise().query(
            'SELECT gpu_id, gpu_name, price, image_url FROM products WHERE gpu_id = ?',
            [productId]
        );

        if (productDetail.length > 0) {
            res.json({ product: productDetail[0] });
        } else {
            res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('상품 정보를 가져오는 도중 오류가 발생했습니다.', error);
        res.status(500).json({ error: '내부 서버 오류' });
    }
});
// 장바구니 테이블에 추가
app.post('/addToCart', async (req, res) => {
    const productId = req.body.productId;

    try {
        const userId = req.session.user ? req.session.user.user_id : null;
        console.log('User ID:', userId); // 사용자 ID 로그 추가
        if (!userId) {
            return res.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' });
        }

        const [product] = await connection.promise().query(
            'SELECT gpu_id, gpu_name, price FROM products WHERE gpu_id = ?',
            [productId]
        );
        console.log('Product:', product); // 상품 정보 로그 추가

        if (product.length > 0) {
            const quantity = 1;
            const price = product[0].price * quantity;

            await connection.promise().query(
                'INSERT INTO shopping_cart (user_id, gpu_id, quantity, price) VALUES (?, ?, ?, ?)',
                [userId, productId, quantity, price]
            );

            res.json({ success: true });
        } else {
            res.json({ success: false, error: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('addToCart 오류:', error);
        res.json({ success: false, error: '장바구니에 추가 중 오류 발생', details: error.message });
    }
});
//getUserCart 나만의 장바구니 테이블 보여주기
app.get('/getUserCart', async (req, res) => {
    // 현재 세션에 사용자 정보가 있는지 확인
    const userId = req.session.user ? req.session.user.user_id : null;

    // 사용자 정보가 없다면 오류 응답
    if (!userId) {
        return res.json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
    }

    try {
        // 사용자의 장바구니 정보를 데이터베이스에서 가져오기
        const [userCart] = await connection.promise().query(
            'SELECT * FROM shopping_cart_view WHERE user_id = ? AND quantity IS NOT NULL AND price IS NOT NULL',
            [userId]
        );

        // 가져온 정보를 클라이언트에 응답
        res.json({ success: true, userCart });
    } catch (error) {
        console.error('사용자 장바구니 정보를 가져오는 중 오류 발생:', error);
        // 오류 발생 시 클라이언트에 오류 응답
        res.status(500).json({ success: false, message: '사용자 장바구니 정보를 가져오는 중 오류가 발생했습니다.' });
    }
});


// 서버 사용자 코드
app.get('/getUserInfo', (req, res) => {
    console.log('GET /getUserInfo'); 
    const user = req.session.user;

    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
    }
});


// 게시글 목록 조회 시 로그 추가
app.get('/getPosts', async (req, res) => {
    try {
        const updatedPosts = await getUpdatedPosts();
        res.json(updatedPosts);
    } catch (error) {
        console.error('게시글 목록 갱신 오류:', error);
        res.status(500).json({ success: false, message: '게시글 목록 갱신 중 오류가 발생했습니다.' });
    }
});


// 게시글 작성 시 로그 추가
app.post('/post', async (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { title, content } = req.body;

    try {
        console.log('Current User ID:', user.user_id); // 로그 추가
        const sqlInsertPost = 'INSERT INTO board (user_id, display_name, title, content) VALUES (?, ?, ?, ?)';
        await connection.promise().query(sqlInsertPost, [user.user_id, user.display_name, title, content]);
        // 새로운 게시글이 추가되면서 클라이언트에서 자동으로 업데이트됩니다.

        res.json({ success: true, message: '게시글이 성공적으로 저장되었습니다.' });
    } catch (error) {
        console.error('게시글 저장 오류:', error);
        res.status(500).json({ success: false, message: '게시글 저장 중 오류가 발생했습니다.' });
    }
});



// 새로운 게시글 목록을 가져오는 함수 추가
async function getUpdatedPosts() {
    const sqlSelectPosts = 'SELECT * FROM board ORDER BY post_date DESC';
    const results = await connection.promise().query(sqlSelectPosts);

    return results[0];
}

//특정 게시글 가져오기
app.get('/getPost/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await getPostById(postId);
        if (post) {
            res.json({ success: true, post });
        } else {
            res.json({ success: false, message: '게시글을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('게시글 가져오기 오류:', error);
        res.status(500).json({ success: false, message: '게시글 가져오기 중 오류가 발생했습니다.' });
    }
});

// 특정 ID의 게시글 가져오기 함수 수정
async function getPostById(postId) {
    const sqlSelectPostById = 'SELECT * FROM board WHERE post_id = ?';
    const [rows] = await connection.promise().query(sqlSelectPostById, [postId]);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    }
}



// '/getAverageStars' 라우트 수정
app.get('/getAverageStars', (req, res) => {
    const productId = req.query.productId;

    // 댓글의 평균 별점을 계산
    const sql = `
        SELECT AVG(star) AS averageStars
        FROM reviews
        WHERE gpu_id = ?;
    `;

    // MySQL 쿼리 수행
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('평균 별점 계산 중 오류:', err);
            res.status(500).json({ error: '평균 별점 계산 중 오류 발생' });
        } else {
            // 조회 결과를 JSON 형태로 응답
            const averageStars = result.length > 0 ? result[0].averageStars : 0;
            res.json({ averageStars }); // 수정: JSON 응답으로 변경
        }
    });
});


// 댓글 추가
app.post('/addComment', async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.user_id : null;
        const productId = req.body.productId;
        const stars = req.body.stars;
        const commentText = req.body.commentText;
        const reviewDate = new Date(); // 현재 날짜 및 시간

        // 별을 선택하지 않았을 경우 디폴트로 0으로 설정
        const effectiveStars = stars || 0;

        const result = await connection.promise().query(
            'INSERT INTO reviews (user_id, gpu_id, star, comment, review_date) VALUES (?, ?, ?, ?, ?)',
            [userId, productId, effectiveStars, commentText, reviewDate]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
        res.json({ success: false });
    }
});

// getComments 라우트 추가
app.get('/getComments', (req, res) => {
    const productId = req.query.productId;

    // productId를 사용하여 댓글 데이터를 조회하는 SQL 쿼리 작성
    const sql = `
        SELECT user.display_name, reviews.star, reviews.comment, reviews.review_date
        FROM reviews
        INNER JOIN user ON reviews.user_id = user.user_id
        WHERE reviews.gpu_id = ?;
    `;

    // MySQL 쿼리 수행
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('댓글 데이터 조회 중 오류:', err);
            res.status(500).json({ error: '댓글 데이터 조회 중 오류 발생' });
        } else {
            // 조회 결과를 JSON 형태로 응답
            console.log(result); // 콘솔에 결과를 출력하여 확인
            res.json({ comments: result });
        }
    });
});

// 래플 페이지 라우트
app.get('/raffle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Raffle.html'));
  });

// 래플 페이지에서 응모 버튼을 눌렀을 때의 라우터
app.post('/enterRaffle', (req, res) => {
    // 사용자가 로그인한 경우 (세션 등을 사용하여 로그인 여부를 확인)
    const userId = req.session.user ? req.session.user.user_id : null;
  
    if (userId) {
      // 이미 래플에 참여한 사용자인지 확인
      const checkQuery = 'SELECT * FROM raffle WHERE user_id = ?';
      connection.query(checkQuery, [userId], (checkErr, checkResult) => {
        if (checkErr) {
          console.error('래플 참여 확인 실패: ' + checkErr.message);
          res.status(500).send('래플 참여 확인 실패');
        } else {
          // 이미 참여한 사용자인 경우 응모를 막음
          if (checkResult.length > 0) {
            console.log('이미 래플에 참여한 사용자입니다.');
            res.status(400).send('이미 래플에 참여한 사용자입니다.');
          } else {
            // 래플 테이블에 사용자 추가
            const insertQuery = 'INSERT INTO raffle (user_id) VALUES (?)';
            connection.query(insertQuery, [userId], (insertErr, insertResult) => {
              if (insertErr) {
                console.error('래플 응모 실패: ' + insertErr.message);
                res.status(500).send('래플 응모 실패');
              } else {
                console.log('래플 응모 성공');
                res.status(200).send('래플 응모 성공');
              }
            });
          }
        }
      });
    } else {
      res.status(401).send('로그인이 필요합니다.');
    }
  });

 // 랜덤으로 당첨자를 뽑아오는 라우터 (중첩 SQL 사용)
app.get('/drawWinnerNested', (req, res) => {
    const drawQuery = `
      SELECT display_name
      FROM user
      JOIN (
        SELECT user_id
        FROM raffle
        ORDER BY RAND()
        LIMIT 1
      ) AS random_raffle
      ON user.user_id = random_raffle.user_id`;
  
    connection.query(drawQuery, (drawErr, drawResult) => {
      if (drawErr) {
        console.error('랜덤 당첨자 뽑기 실패: ' + drawErr.message);
        res.status(500).json({ error: '랜덤 당첨자 뽑기 실패' });
      } else {
        const winnerName = drawResult[0].display_name;
        console.log('랜덤 당첨자: ', winnerName);
        res.status(200).json({ winnerName });
      }
    });
  });
  
  // 래플 참여자 수를 조회하는 라우터
app.get('/raffleParticipants', (req, res) => {
    const countQuery = 'SELECT COUNT(*) AS participantCount FROM raffle';
    connection.query(countQuery, (countErr, countResult) => {
      if (countErr) {
        console.error('래플 참여자 수 조회 실패: ' + countErr.message);
        res.status(500).send('래플 참여자 수 조회 실패');
      } else {
        const participantCount = countResult[0].participantCount;
        console.log('래플 참여자 수 조회 성공');
        res.status(200).json({ participantCount });
      }
    });
  });

  // 장바구니 데이터를 저장할 변수
let userOrders = {};

// 장바구니 정보를 가져오는 엔드포인트
app.get('/getUserOrders', (req, res) => {
  const userId = req.session.user ? req.session.user.user_id : null;

  if (!userId) {
    return res.json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
  }

  if (!userOrders[userId]) {
    userOrders[userId] = [];
  }

  res.json({ success: true, userOrders: userOrders[userId] });
});

// 주문을 처리하는 엔드포인트
app.post('/placeOrder', (req, res) => {
  const { userId, orderItems } = req.body;

  // 주문 정보를 저장
  if (!userOrders[userId]) {
    userOrders[userId] = [];
  }

  userOrders[userId] = orderItems;

  console.log('User Orders:', userOrders);

  res.json({ success: true, message: '주문이 완료되었습니다.' });
});


// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중`);
});
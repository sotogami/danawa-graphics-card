document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if (productId) {
        loadComments(productId);
        // 상세 정보 가져오기
        fetch(`/getProductDetail?productId=${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.product) {
                    // 제품 이미지 표시
                    const productImage = document.getElementById('product-image');
                    productImage.src = data.product.image_url;
                    productImage.alt = data.product.gpu_name;

                    // 제품명 표시
                    const productName = document.getElementById('product-name');
                    productName.textContent = data.product.gpu_name;

                    // 제품 가격 표시
                    const productPrice = document.getElementById('product-price');
                    const formattedPrice = parseFloat(data.product.price).toFixed(2) + "원";
                    productPrice.textContent = "가격: " + formattedPrice;

                    // "장바구니에 추가" 버튼 이벤트 핸들러
                    const addToCartButton = document.getElementById('add-to-cart-button');

                    addToCartButton.addEventListener('click', function () {
                        // 상세페이지의 상품 ID 가져오기
                        const productId = urlParams.get('productId');

                        // 가격이 0원인 경우 추가를 막음
                        if (parseFloat(data.product.price) === 0) {
                            alert('품절이거나 판매하지 않는 제품입니다.');
                        } else {
                            // 서버에 장바구니에 추가 요청 보내기
                            addToCart(productId);
                        }
                    });

                                    // 별점 기능
                    const starRating = document.getElementById('star-rating');
                    const starLabels = starRating.querySelectorAll('label');

                    starLabels.forEach(label => {
                        label.addEventListener('click', handleStarClick);
                    });

                    function handleStarClick(event) {
                        const clickedIndex = Array.from(starLabels).indexOf(event.target);

                        starLabels.forEach((label, index) => {
                            label.classList.toggle('active', index <= clickedIndex);
                        });
                    }

                    // "댓글 추가" 버튼 이벤트 핸들러
                    const addCommentButton = document.getElementById('add-comment-button');
                    const commentInput = document.getElementById('comment-input');

                    addCommentButton.addEventListener('click', function () {
                        const commentText = commentInput.value;
                        const stars = Array.from(starLabels).filter(label => label.classList.contains('active')).length;

                        // 추가된 부분: 별이 선택되어 있지 않으면 추가를 막음
                        if (stars === 0) {
                            alert('별을 선택해주세요.');
                            return;
                        }

                        addComment(productId, stars, commentText);
                    });
                } else {
                    console.error('상품 데이터 형식이 올바르지 않습니다.');
                }
            })
            .catch(error => console.error('상품 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    } else {
        console.error('유효하지 않은 productId입니다.');
    }
    // 댓글 로딩 함수
    function loadComments(productId) {
        fetch(`/getComments?productId=${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.comments) {
                    const commentsList = document.getElementById('comments-list');
                    commentsList.innerHTML = ''; // 기존 댓글 삭제
    
                    data.comments.forEach(comment => {
                        const listItem = document.createElement('li');
                        listItem.className = 'comment-item';
                        listItem.innerHTML = `
                            <strong>${comment.display_name}</strong>
                            <div class="star-rating">
                                ${getStarRatingHtml(comment.star)}
                            </div>
                            <p class="comment-content">댓글: ${comment.comment}</p>
                            <hr>
                            <p class="comment-date">${formatDate(comment.review_date)}</p>
                        `;
                        commentsList.appendChild(listItem);
                    });
                } else {
                    console.error('댓글 데이터 형식이 올바르지 않습니다.');
                }
            })
            .catch(error => console.error('댓글 데이터를 불러오는 도중 오류가 발생했습니다.', error));
    }

    // 서버에 장바구니에 추가 요청 보내는 함수
    function addToCart(productId) {
        console.log('addToCart 함수 실행 확인:', productId);
        // 서버에 POST 요청 보내기
        fetch('/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        })
            .then(response => response.json())
            .then(data => {
                // 서버에서 받은 응답 처리
                if (data.success) {
                    alert('장바구니에 추가되었습니다.');
                } else {
                    alert('장바구니 추가에 실패했습니다.');
                }
            })
            .catch(error => console.error('장바구니 추가 중 오류 발생:', error));
    }

    function scrollToBottom() {
        const commentsList = document.getElementById('comments-list');
        commentsList.scrollTop = commentsList.scrollHeight;
    }

    // 서버에 댓글 추가 요청 보내는 함수
    function addComment(productId, stars, commentText) {
        fetch('/addComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                stars,
                commentText,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('댓글이 성공적으로 추가되었습니다.');
                // 성공 시 필요한 추가 작업 수행
            } else {
                alert('댓글 추가에 실패했습니다.');
            }
        })
        .catch(error => console.error('댓글 추가 중 오류 발생:', error));
        scrollToBottom();
    }
    // 별점에 따라 별이 빛나는 아이콘 HTML 생성 함수
    function getStarRatingHtml(star) {
        const maxStars = 5;
        let starHtml = '';

        for (let i = 1; i <= maxStars; i++) {
            const filledStar = i <= star ? 'star-icon' : ''; // 별 채우기 여부 확인
            starHtml += `<span class="fa ${filledStar}"></span>`;
        }

        return starHtml;
    }

    // 날짜 형식을 변경하는 함수
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', options);
}
});
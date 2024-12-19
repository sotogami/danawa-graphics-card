document.addEventListener('DOMContentLoaded', function () {
    const questionForm = document.getElementById('questionForm');

    // 사용자 정보를 가져오는 함수 호출
    async function getUserInfo() {
        try {
            const response = await fetch('/getUserInfo');
            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('사용자 정보를 가져오는 도중 오류가 발생했습니다.', error);
            return null;
        }
    }

    // 목록 갱신 함수
    function refreshQuestionList() {
        const questionListElement = document.getElementById('questionList');
        questionListElement.innerHTML = ''; // 목록 초기화

        // fetch('/getPosts') 이후에 결과 확인 로그 추가
        fetch('/getPosts')
            .then(response => response.json())
            .then(data => {
                console.log('Received Posts:', data); // 로그 추가
                displayQuestionList(data, questionListElement);
            })
            .catch(error => console.error('게시글 목록 갱신 오류:', error));
    }

    // 추가: 질문 목록 표시 함수
    function displayQuestionList(questionList, questionListElement) {
        questionList.forEach(question => {
            const listItem = document.createElement('li');
            // 수정: 질문 목록에서 각 항목을 클릭하면 자세한 내용을 보여주도록 링크 변경
            listItem.innerHTML = `<a href="#" data-postid="${question.post_id}" class="question-link">${question.title}</a> by ${question.display_name} on ${question.post_date}`;
            questionListElement.appendChild(listItem);
        });
    
        // 추가: 질문 링크에 이벤트 리스너 등록
        document.querySelectorAll('.question-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const postId = this.getAttribute('data-postid');
                showPostDetails(postId);
            });
        });
    }
    // 추가: 게시글 상세 정보 표시 함수 수정
        async function showPostDetails(postId) {
            try {
                const userInfo = await getUserInfo();
                if (!userInfo || !userInfo.user_id) {
                    alert('로그인이 필요합니다.');
                    return;
                }

                // 추가: 서버에서 게시글과 사용자 정보를 가져오기
                const response = await fetch(`/getPost/${postId}`);
                const data = await response.json();

                if (data.success) {
                    const post = data.post;

                    // 추가: 현재 사용자의 ID와 게시글의 사용자 ID 비교
                    if (userInfo.user_id === post.user_id) {
                        alert(`게시글 내용:\n\n${post.content}`);
                    } else {
                        alert('다른 사용자의 게시물입니다.');
                    }
                } else {
                    alert('게시글을 가져오는 데 문제가 발생했습니다.');
                }
            } catch (error) {
                console.error('게시글 가져오기 오류:', error);
                alert('게시글을 가져오는 도중 오류가 발생했습니다.');
            }
        }


    // 추가: 질문 폼에 이벤트 리스너 등록
    questionForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        // 사용자 정보를 가져오는 함수 호출
        const userInfo = await getUserInfo();

        if (!userInfo || !userInfo.display_name) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 서버에 데이터 전송
        fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                display_name: userInfo.display_name,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게시되었습니다.');
                    refreshQuestionList();
                } else {
                    alert('게시 실패: ' + data.message);
                }
            })
            .catch(error => console.error('게시 요청 오류:', error));
    });

    // 추가: 초기 로딩 시 목록 갱신
    refreshQuestionList();
});

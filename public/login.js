document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const user_name = document.getElementById("user_name").value;
        const password = document.getElementById("password").value;

        try {
            console.log('전송할 데이터:', { user_name, password });

            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_name, password }),
            });

            if (response.ok) {
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data = await response.json();
                        if (data.success) {
                            const user = data.user;
                            console.log(user); // 사용자 정보 사용
                            alert("로그인 성공!");
                            window.location.href = "/main_logged_in.html"; // 적절한 경로로 수정
                        } else {
                            alert("로그인 실패: " + data.message);
                        }
                    } else {
                        console.error("서버 응답 오류: JSON이 아닌 형식");
                        const text = await response.text();
                        console.error("서버 응답 내용:", text);
                    }
                } catch (jsonError) {
                    console.error("JSON 파싱 오류:", jsonError);
                }
            } else {
                console.error("서버 응답 오류:", response.status);
            }
        } catch (error) {
            console.error("오류 발생:", error);
        }
    });
});

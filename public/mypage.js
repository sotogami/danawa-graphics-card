// 서버에서 동적으로 사용자 ID를 받아오는 로직
async function getUserId() {
    try {
      const response = await fetch('/getUserInfo');
      const data = await response.json();
  
      if (data.success) {
        return data.userId;
      } else {
        console.error('사용자 ID를 가져오지 못했습니다.');
        return null;
      }
    } catch (error) {
      console.error('사용자 ID 요청 중 오류:', error);
      return null;
    }
  }
  
  // 사용자 정보를 가져오고 화면에 표시하는 함수
  async function getUserInfo(user_id) {
    try {
      const response = await fetch('/getUserInfo');
      const data = await response.json();
      const loginInfoBox = document.getElementById('login-info-box');
      const loginInfo = document.getElementById('login-info');
  
      if (data.success) {
        const user = data.user;
        loginInfo.innerText = user.user_name;
      } else {
        loginInfoBox.innerHTML = '<div class="sub-box-title">로그인 정보:</div><div>사용자 정보를 가져오지 못했습니다.</div>';
        console.error('사용자 정보를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 요청 중 오류:', error);
      const loginInfoBox = document.getElementById('login-info-box');
      loginInfoBox.innerHTML = '<div class="sub-box-title">로그인 정보:</div><div>서버에 연결할 수 없습니다.</div>';
    }
  }
  
  // 마이페이지의 주문한 상품 갯수를 업데이트하는 함수
  function updateMyPageOrdersCount(count) {
    try {
      const myPageOrdersCount = document.getElementById('myPageOrdersCount');
  
      if (myPageOrdersCount) {
        myPageOrdersCount.textContent = `주문한 상품 갯수: ${count}`;
      } else {
        console.error('myPageOrdersCount 엘리먼트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }
  
  // 마이페이지 갱신 함수
  async function updateMyPage(user_id) {
    try {
      const myPageOrdersCount = document.getElementById('myPageOrdersCount');
  
      if (myPageOrdersCount) {
        const userCart = await getUserCart();
        myPageOrdersCount.textContent = `주문한 상품 갯수: ${userCart.length}`;
      } else {
        console.error('myPageOrdersCount 엘리먼트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }
  
  // 주문하기 버튼을 눌렀을 때 호출되는 함수
  async function placeOrder(user_id) {
    try {
      const userCart = await getUserCart();
  
      const response = await fetch('/placeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user_id,
          orderItems: userCart,
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        const count = userCart.length;
        updateMyPageOrdersCount(count);
        alert(`주문이 완료되었습니다. 주문한 상품 갯수: ${count}`);
      } else {
        alert('주문 실패하였습니다.');
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  }
  
  // 장바구니 정보를 가져오는 함수
  async function getUserCart() {
    try {
      const response = await fetch('/getUserCart');
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (data.success) {
          return data.userCart;
        } else {
          console.error('장바구니 정보를 가져오지 못했습니다.');
          return [];
        }
      } else {
        console.error('서버에서 JSON 형식의 응답이 아닌 데이터를 반환했습니다.');
        return [];
      }
    } catch (error) {
      console.error('오류 발생:', error);
      return [];
    }
  }
  
  // 페이지 로드 시 초기화 함수 호출
  document.addEventListener('DOMContentLoaded', initPage);
  
  // 페이지 로드 시 실행되는 함수
  async function initPage() {
    const user_id = await getUserId();
  
    if (user_id) {
      getUserInfo(user_id);
      updateMyPage(user_id);
    }
  }
  
  // 고객센터 문의내역 페이지로 이동하는 함수
  function redirectToCustomerPage() {
    window.location.href = 'customer.html';
  }
  
  
    



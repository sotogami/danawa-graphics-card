import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# MySQL 연결 정보
db_config = {
    "user": "root",
    "password": "ezHvqEwpdF1UH7yTi1yC",
    "host": "localhost",
    "database": "dgbm"
}

# MySQL 연결
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# 크롬드라이버 실행
driver = webdriver.Chrome()

# 크롬 드라이버에 url 주소 넣고 실행
driver.get("https://sammy310.github.io/dev/csv_viewer/csv_viewer.html?category=VGA&date=202311#")

# 페이지가 완전히 로딩되도록 3초동안 기다림
time.sleep(3)

# LC2부터 LC966까지 반복
for i in range(2, 966):
    lc_number = f"LC{i}"

    element = driver.find_element(By.ID, lc_number)
    
    gpu_name = element.find_element(By.CSS_SELECTOR, '[target="_blank"]').text
    print(f'{lc_number} - GPU 이름: {gpu_name}')

    td_elements = element.find_elements(By.CSS_SELECTOR, 'td')
    if td_elements:
        price_text = td_elements[3].text
        print(f'{lc_number} - 가격 텍스트: {price_text}')

        # 일시품절이거나 가격비교예정일경우
        if price_text == '일시품절' or price_text == '가격비교예정':
            stock = 0
            price = 0
        else:
            # 일시품절이 아닌 경우
            stock = 5 if float(price_text.replace(',', '')) >= 1 else 0
            price = float(price_text.replace(',', ''))

        # gpu_name이 존재하는지 확인
        cursor.execute(f"SELECT COUNT(*) FROM products WHERE gpu_name = '{gpu_name}';")
        result = cursor.fetchone()
        gpu_name_exists = result[0] > 0

        if gpu_name_exists:
            # 기존 레코드 업데이트
            update_query = f"""
            UPDATE products
            SET 
                stock = {stock},
                price = {price}
            WHERE gpu_name = '{gpu_name}';
            """
        else:
            # 새로운 레코드 삽입
            update_query = f"""
            INSERT INTO products (gpu_name, stock, price)
            VALUES ('{gpu_name}', {stock}, {price});
            """

        try:
            # SQL 실행
            cursor.execute(update_query)

            # 변경 내용을 커밋
            conn.commit()

            print(f'{lc_number} - 데이터베이스 업데이트 완료!')

        except Exception as e:
            # 에러 발생 시 롤백
            print(f'{lc_number} - 에러 발생: {e}')
            conn.rollback()

# MySQL 연결 종료
cursor.close()
conn.close()

# 웹 드라이버 종료
driver.quit()

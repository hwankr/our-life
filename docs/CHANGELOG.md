# 변경 로그 (Changelog)

프로젝트 일자별 변경 내역을 기록합니다.

---

## 2026-01-31

### 수정
- 기간 생성 기본 날짜가 빈 값으로 저장되던 문제 수정

## 2026-02-01 (3)

### 추가
- 목표 주기(Cycle) 기능 추가
  - 채우기(ROUTINE): 전체 기간 / 주간 / 월간 선택 가능
  - 아껴쓰기(LIMIT): 주간 / 월간 선택 가능
  - `goals` 테이블에 `cycle`, `limit_value` 컬럼 추가
  - 주기별 달성률 계산 로직 구현 (`goal-calculator.ts`)

### 수정
- GoalCard 레이아웃 깨짐 수정: 그리드 내 모든 카드가 동일한 높이 유지하도록 CSS 개선
  - `h-full flex flex-col`, `flex-1`, `mt-auto` 속성 적용
- Limit 목표 그리드 넘침 현상 수정
  - `min-w-0`, `w-full`, `max-w-full` 속성 추가로 그리드 셀 너비 준수 강제
  - `p-1` 패딩 추가로 선택된 월의 테두리(Ring) 잘림 현상 해결
- Limit 목표 UI 개편 (사용자 피드백 반영)
  - 전체 기간 그리드 제거 (Simpler UI)
  - "N월 월간(주간) 현황" 표시 및 현재 사용량/한도(Current/Limit) 숫자 표시 추가
  - **Segmented Bar (칸 나누기)** 도입: 한도가 20회 이하인 경우, 직관적인 칸 단위로 표시하여 남은 횟수를 쉽게 파악 가능하도록 개선
  - 남은 횟수 텍스트 추가 (예: `(3회 남음)`)

---

## 2026-02-01 (2)

### 추가
- 노션 스타일 캘린더 기능 구현
  - `PeriodCalendar` 컴포넌트: 월간 캘린더 뷰, 참여자 필터, 이전/다음 월 네비게이션
  - `DayDetailModal` 컴포넌트: 날짜 클릭 시 일기 + 달성 목표 팝업 표시
  - Period 페이지에 캘린더 통합 (Progress Bar 아래 메인 위치)

### 변경
- `middleware.ts` → `proxy.ts`로 마이그레이션 (Next.js 16 신규 규칙)
- TypeScript null 타입 오류 수정 (`goal.target_count`)

---

## 2026-02-01

### 추가
- 프로젝트 초기화 (Next.js 16.1.6 + Supabase)
- 9개 페이지 라우트 구현
  - 랜딩, 로그인, 기간 생성, 기간 상세, 개인 상세, 일일 기록
- 5개 DB 테이블 스키마 (`supabase/schema.sql`)
- 3가지 목표 타입 지원 (ROUTINE, LIMIT, OBJECTIVE)
- 목표 달성률 계산 로직 (`goal-calculator.ts`)
- shadcn/ui 컴포넌트 14개 설치

### 결정
- 기술 스택: Supabase + Next.js (App Router)
- 단일 Goal 테이블 + optional fields 방식
- LIMIT 중복 정책: 하루에 여러 번 체크 허용
- 메인 대시보드 UI 개편 (기간 목록 뷰, 모달 생성)
    - `/app` 리다이렉트 제거 및 대시보드화
    - `/periods/new` 페이지 삭제 및 모달로 통합
- 다크/라이트 모드 토글 기능 추가
- 대시보드 헤더에 사용자 메뉴 및 로그아웃 버튼 추가
- 랜딩 페이지 로그인 버튼 텍스트 명확화 ("Google로 로그인")
- `framer-motion` 도입 및 전체 디자인 고도화
    - 페이드인, 순차 등장(Stagger) 등 애니메이션 적용
    - 랜딩 페이지 리디자인 (움직이는 배경, 타이포그래피)
    - 대시보드 및 카드 UI 개선 (Glassmorphism, Hover 효과)
- 상세 페이지 디자인 개편 (`/periods/[id]`, `/periods/[id]/users/[id]`)
    - 기간 요약 페이지: 프로그레스바 및 참여자 카드 디자인 개선
    - 개인 목표 페이지: 프로필 헤더, 목표 리스트 애니메이션 적용, 오늘의 기록 버튼 개선
    - `GoalCard` 디자인 고도화 (타입별 색상/아이콘 구분)
- 수정 기능 구현
    - 기간(Period) 수정: 기간명, 날짜 변경 및 파트너 추가(초대) 기능
    - 기간(Period) 삭제: 기간 삭제 시 포함된 모든 데이터(목표, 기록) 일괄 삭제 기능 추가
    - 목표(Goal) 수정: 목표 제목, 수치(횟수/목표량) 등 세부 내용 수정
    - 목표 삭제: 더보기 메뉴를 통한 삭제 기능 구현


## 2026-02-01 (4)

### Fix
- Allow decimals for OBJECTIVE goal values
  - goals.target_value/achieved_value -> NUMERIC
  - Goal add/edit input allows decimals
---

## 템플릿

### YYYY-MM-DD

#### 추가
- [새로 추가된 기능/파일]

#### 변경
- [수정된 기능/파일]

#### 수정
- [버그 수정]

#### 삭제
- [제거된 기능/파일]

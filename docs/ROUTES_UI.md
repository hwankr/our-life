# 라우팅 & UI 요약

## 페이지 구조

```
/                           → 랜딩/로그인
/app                        → Active Period로 리다이렉트
/periods/new                → 새 기간 생성
/periods/[periodId]         → 기간 요약 (메인)
/periods/[periodId]/users/[userId]          → 개인 상세
/periods/[periodId]/users/[userId]/logs/[date]  → 일일 기록
```

---

## 페이지별 컴포넌트

### `/` (랜딩)
- `Hero` - 서비스 소개
- `LoginButton` - Google OAuth

### `/periods/[periodId]` (기간 요약)
- `PeriodHeader` - 제목, 기간, D-day
- `UserSummaryCard` x 2
  - 아바타, 이름
  - 전체 달성률
  - 미니 프로그레스
  - "상세 보기" 버튼

### `/periods/[periodId]/users/[userId]` (개인 상세)
- `UserHeader` - 아바타, 이름
- `GoalList`
  - `GoalCard` (타입별 UI)
    - ROUTINE: ProgressBar
    - LIMIT: MonthlyGrid (6칸)
    - OBJECTIVE: StudyLogCount
  - `AddGoalButton`
- `RecentLogs` - 최근 기록 목록
- `TodayLogButton`

### `/periods/[periodId]/users/[userId]/logs/[date]` (일일 기록)
- `DatePicker`
- `DiaryEditor`
- `GoalCheckList`
  - 목표별 체크박스
  - SubcategoryCheckboxes (OBJECTIVE)
- `SaveButton`

---

## 공통 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `ProgressBar` | 진행률 바 |
| `MonthlyGrid` | 월별 성공/실패 그리드 |
| `Avatar` | 사용자 아바타 |
| `Card` | 카드 레이아웃 |
| `Button` | 버튼 (shadcn/ui) |

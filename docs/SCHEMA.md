# DB 스키마 문서

## ERD 개요

```
User (1) ──< (N) Goal
User (1) ──< (N) DailyLog
Period (1) ──< (N) Goal
Period (1) ──< (N) DailyLog
DailyLog (1) ──< (N) GoalLog
Goal (1) ──< (N) GoalLog
```

---

## 테이블 정의

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | Supabase Auth 연동 |
| email | TEXT | 이메일 (UNIQUE) |
| name | TEXT | 표시 이름 |
| avatar_url | TEXT | 프로필 이미지 |
| created_at | TIMESTAMPTZ | 생성일 |

### periods
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| title | TEXT | 기간 제목 (예: "2026 상반기") |
| start_date | DATE | 시작일 |
| end_date | DATE | 종료일 |
| is_active | BOOLEAN | 현재 진행중 여부 |
| participant_ids | UUID[] | 참여자 ID 배열 |
| created_at | TIMESTAMPTZ | 생성일 |

### goals
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| period_id | UUID (FK) | 기간 |
| user_id | UUID (FK) | 소유자 |
| title | TEXT | 목표 제목 |
| type | TEXT | ROUTINE / LIMIT / OBJECTIVE |
| cycle | TEXT | 주기: TOTAL / WEEKLY / MONTHLY |
| target_count | INTEGER | (ROUTINE) 목표 횟수 |
| current_count | INTEGER | (ROUTINE) 현재 횟수 캐시 |
| limit_value | INTEGER | (ROUTINE/LIMIT) 주간/월간 제한값 |
| monthly_limit | INTEGER | (LIMIT) 월 제한 [레거시] |
| subcategories | JSONB | (OBJECTIVE) 세부 카테고리 |
| is_achieved | BOOLEAN | (OBJECTIVE) 달성 여부 |
| achieved_value | INTEGER | (OBJECTIVE) 최종 점수 |
| target_value | INTEGER | (OBJECTIVE) 목표 점수 |
| unit | TEXT | 단위 (회, 점 등) |
| created_at | TIMESTAMPTZ | 생성일 |

### daily_logs
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| user_id | UUID (FK) | 작성자 |
| period_id | UUID (FK) | 기간 |
| log_date | DATE | 날짜 |
| diary | TEXT | 일기 내용 |
| created_at | TIMESTAMPTZ | 생성일 |
| updated_at | TIMESTAMPTZ | 수정일 |

**UNIQUE**: (user_id, period_id, log_date)

### goal_logs
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| daily_log_id | UUID (FK) | 일일 기록 |
| goal_id | UUID (FK) | 목표 |
| count | INTEGER | 횟수 (기본 1) |
| subcategory_data | JSONB | 세부 카테고리 체크 |
| memo | TEXT | 메모 |
| created_at | TIMESTAMPTZ | 생성일 |

**UNIQUE**: (daily_log_id, goal_id)

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-02-01 | 초기 스키마 설계 |

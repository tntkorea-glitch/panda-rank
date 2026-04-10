---
name: Project Status
description: panda-rank(→Ranktica 리네임 예정) 현재 상태 및 다음 작업
type: project
originSessionId: 70847eb1-b296-43c2-a732-69a10e043de7
---
## 현재 상태
Phase 1 구현 완료, 빌드 성공, dev 서버 동작 확인됨.

## Next up when resuming
1. **폴더명 변경**: panda-rank → Ranktica로 리네임 후 아래 파일들 업데이트 필요:
   - `.claude/settings.json` 경로
   - `package.json` name
   - GitHub 레포명 (`gh repo rename Ranktica`)
   - git remote URL
   - Claude Code 메모리 경로 마이그레이션
   - Instica 폴더가 만들어졌을 수 있으니 삭제 필요 (`D:/dev/Instica`)
2. **Vercel 연동**: `vercel link` + 환경변수 설정
3. **ANTHROPIC_API_KEY 설정**: .env.local에 실제 키 입력해야 AI 기능 동작
4. **Phase 2 개발**: 블로그 진단, 게시글 진단, 블로그 순위 추적

**Why:** 사용자가 세션 종료 직전 Ranktica로 폴더명 변경 요청함
**How to apply:** 새 세션 시작 시 가장 먼저 리네임 작업 완료할 것

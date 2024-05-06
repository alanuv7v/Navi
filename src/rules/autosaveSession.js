/* 
10분마다?
변화가 생길 때마다?
변화의 기준은 몇단계 네스팅까지 들어가나?
appSession.tree가 재정의되는 것은 session 변화.
그럼 appSession.tree.data가 변하는 것은? session의 변화인가?
그건 내가 정하기 나름.

appSession의 직할 프롭 변화가 생길 경우, 매번 DB에 세션을 저장하자. 
appSession의 직할 프롭 변화의 데이터가 변할 경우, 마지막 저장으로부터 10분 이상 지났다면 저장하자.

appSession의 변화 추적 방법:
1. Session을 프록시로 만든다.
2. Session의 프롭들을 게터와 세터로 만든다.

*/


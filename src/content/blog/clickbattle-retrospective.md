---
title: "[프로젝트 회고] ClickBattle"
description: "대학별 클릭 노가다 경쟁 게임"
pubDate: "2022-02-02T14:05:45+09:00"
updatedDate: "2024-11-13T12:49:07+09:00"
---

> **대학별 클릭 노가다 경쟁 게임**

![ClickBattle 로그인과 순위 화면](/images/tistory/clickbattle-retrospective/screen.jpg)

[프로젝트 깃허브 https://github.com/awesomemin/clickBattle](https://github.com/awesomemin/clickBattle "프로젝트 깃허브")

~~[프로젝트 페이지](http://clickbattle.site "프로젝트 페이지")~~ ~~[http://clickbattle.site](http://clickbattle.site)~~  만료됨(접속 불가)

**프로젝트 기간** : 2022.01.09. ~ 2022.01.30

## **주요 기능**

\- 대학교명과 이름을 입력하여 로그인 (쿠키를 이용해서 로그인 유지)

\- 파란색 '+1' 버튼을 클릭하여 점수 획득

\- 실시간으로 학교별, 개인별 순위 확인

## **성과**

최초 배포 후 3시간

\- 클릭 약 650,000회

\- 방문자 수 약 800명

최초 배포 후 24시간

\- 클릭 약 3,200,000회

\- 방문자 수 약 3,300명

최초 배포 후 72시간

\- 클릭 약 7,400,000회

\- 방문자 수 약 4,000명

## **사용스택**

**[Front-End]**

\- Javascript

\- Axios : HTTP request 전송

\- Bootstrap : UI 디자인

\- nunjucks : HTML 동적 템플릿

**[Back-End]**

\- Node.js

\- MySQL : 데이터베이스

\- Express.js : 서버 프레임워크

\- dotenv : DB 비밀번호 관리

\- helmet : Express 보안 미들웨어

\- hpp : HTTP Parameter Pollution 방어 미들웨어

\- winston : 로그 기록

\- morgan : 로그 기록

\- sequelize : ORM, Javascript로 MySQL DB와 통신할 수 있게 해줌

**[Deploy]**

\- AWS Lightsail : 클라우드 가상 서버

\- Gabia : 도메인 구매, 네임서버

\- pm2 : Process Manager, 서버가 종료되면 자동으로 재시작해줌

## **TroubleShooting**

**1.**

최초 배포 후 약 2시간 정도 지나서 트래픽이 늘면서 페이지가 먹통이 되는 문제가 발생했다. 에러 로그도 없고 서버가 종료되지도 않은 것으로 보아 서버 에러는 아닌 것 같았는데, 정확한 원인은 알 수가 없었다. 서비스 사용자들이 이탈할까봐 마음이 급해서 일단 Lightsail instance를 재시작하는 것으로 해결했다. 그러나 같은 문제가 30~60분 간격으로 약 4회정도 반복됐다. 그러다 Lightsail 모니터링 페이지에서 서버 CPU 부족이 원인임을 발견했다. (아래 사진 참고)

![변경 전 서버 CPU 사용률과 버스트 용량](/images/tistory/clickbattle-retrospective/cpu-before.png)

원인 파악 후, 서버 CPU 사용량을 낮추기 위한 방법을 고민했다. **먼저, 기존 1.0초로 설정되어있던 실시간 랭킹 업데이트 주기를 1.5초로 늘렸다.** (약 50% 성능 향상이 있을 것으로 기대했음) 그러나 CPU 사용량이 전혀 낮아지지 않았다. 생각해보니 서버에 부담을 주는 것은 1초에 단 한 번 수행되는 랭킹 업데이트 request가 아니라 사용자들이 클릭할 때마다 실행되는 점수 증가 request였다. 랭킹 업데이트 request는 setInterval 함수로 호출되기 때문에 호출 주기를 마음대로 조절할 수 있지만 점수 증가 request는 사용자들이 버튼을 누를 때마다 호출되기 때문에 어떻게 해결해야하나 고민이 되었다. (광클시 평균적으로 초당 10번 이상의 클릭이 발생했다. 즉, 사용자 1명당 초당 10개의 request가 발생했다.) **이를 해결하기 위해 front-end에서 사용자가 1초간 누른 횟수를 임시로 기록해두었다가, 매 1초마다 서버로 request를 전송하도록 했다.** 이렇게 하면 사용자의 버튼 클릭 횟수와 관계없이 서버에 전송되는 request를 초당 1개로 제한할 수 있었다. (아래 코드 참고)

\- 수정 전

```javascript
// main.js (front-end)
btn.addEventListener('click', async () => {
  const res = await axios.post('/main');
  indivScore.innerText = res.data.user[0].point + 1;
  univScore.innerText = res.data.univ[0].point + 1;
});

// app.js (back-end)
app.post('/main', async (req, res, next) => {
  try {
    const user = await User.findAll({
      where: {
        id: req.cookies.id,
      }
    });
    const univ = await Univ.findAll({
      where: {
        name: user[0].dataValues.univ,
      }
    });
    await User.update({ point: user[0].dataValues.point + 1 }, {
      where: {
        id: user[0].dataValues.id,
      }
    });
    await Univ.update({ point: univ[0].dataValues.point + 1 }, {
      where: {
        id: univ[0].dataValues.id,
      }
    });
    const data = {
      user: user,
      univ: univ,
    };
    res.json(data);
  } catch (err) {
    next(err);
  }
})
```

---

\- 수정 후

```javascript
// main.js (front-end)
let clicksInSec = 0;

btn.addEventListener('click', () => {
  clicksInSec++;
  indivScore.innerText = parseInt(indivScore.innerText) + 1;
})

setInterval( async () => {
  const data = {
    point: clicksInSec
  }
  clicksInSec = 0;
  const res = await axios.post('/main', data);
  univScore.innerText = res.data.univ[0].point;
}, 1500);

// app.js (back-end)
app.post('/main', async (req, res, next) => {
  try {
    const user = await User.findAll({
      where: {
        id: req.cookies.id,
      }
    });
    const univ = await Univ.findAll({
      where: {
        name: user[0].dataValues.univ,
      }
    });
    await User.update({ point: user[0].dataValues.point + req.body.point }, {
      where: {
        id: user[0].dataValues.id,
      }
    });
    await Univ.update({ point: univ[0].dataValues.point + req.body.point }, {
      where: {
        id: univ[0].dataValues.id,
      }
    });
    const data = {
      user: user,
      univ: univ,
    };
    res.json(data);
  } catch (err) {
    next(err);
  }
})
```

결과적으로, **서버의 CPU 사용률을 70% 이상에서 20% 언저리까지 끌어내릴 수 있었다.** 아래 사진을 보면 CPU 사용량이 줄어든 것을 볼 수 있고, 특히 아래 그래프에서 잔여 CPU 버스트 용량이 줄어드는 속도가 2배 이상 느려진 것을 확인할 수 있다.

![변경 후 서버 CPU 사용률과 버스트 용량](/images/tistory/clickbattle-retrospective/cpu-after.png)

**2.**

서비스에 트래픽이 몰리고 사용자가 늘면서 매크로를 사용하는 악성 사용자도 발생했다. 특히, 이전 문단에서 CPU 사용량을 줄이기 위해 점수 증가 request를 1초에 한 번씩 전송하도록 변경하는 과정에서 심각한 취약점이 발생했다. (예리한 독자라면 코드를 읽으면서 이미 눈치를 챘을지도 모른다.) 원래는 request 한 번에 점수도 1점씩 오르는 방식이었는데, 변경 이후에는 request body에 포함된 point의 값만큼 점수를 올리도록 설계하였다. (point = 사용자가 1초간 버튼을 누른 횟수) **그런데, point 값에 제한이 없어서 front단에서 point 값을 임의로 변경하여 request를 보내면 조작된 point 값만큼 점수가 증가하는 문제가 있었다.** 처음엔 이 문제를 모르다가, 점수가 1초에 300씩 꾸준히 증가하는 사용자를 발견하고 로그를 읽어보다가 문제를 깨달았다. 문제를 파악한 이후에 즉시 다음 코드를 추가하였다.

```javascript
if(req.body.point >= 25) {
  req.body.point = 25;
}
```

**이를 통해 초당 25번이 넘는 클릭에 대해서는 단 25번만 클릭한 것으로 간주되도록 처리했다.** 이렇게 문제가 해결된 것처럼 보였다. 그런데 훨씬 더 심각한 문제가 곧 발생했다. 클릭 횟수 백만 번이 넘던 1등 대학의 점수가 0점으로 초기화된 것이다. **point의 값이 음수가 되는 것에 대한 제한이 없었던 게 문제였다.** 어떤 악성 사용자가 point에 거대한 음수를 넣고 request를 전송한 것으로 보였다. 다행히 문제를 빨리 인식하고 point 값이 음수가 될 수 없도록 제한하고, 대학 점수도 복구시켰다. point 값이 당연히 양수가 될 의도로 코딩했지만, **프로그램은 내 의도에 따라 움직이는 게 아니라 작성된 코드에 따라 움직인다는 것을 뼈저리게 깨달았다.** (특히 타입의 구분이 없는 Javascript라 더욱 그런 것 같다. 얼른 Typescript를 공부해야겠다.)

**사족**

1\. 생각보다 많은 트래픽이 몰려서 놀랐다. 나같은 초보 개발자가 이런 트래픽을 경험해볼 기회가 흔치 않은데, 정말 귀한 경험이었고 많이 배웠다.

2\. 에브리타임 홍보게시판과 인스타그램 스토리에 올린 것 빼고는 마케팅에 힘을 쏟지 않았는데도 클릭배틀이 정말 많이 퍼져나간 것 같다. 이래서 바이럴 바이럴 하나보다.

3\. 개발 중에 엄마가 "그렇게 단순한 게임을 누가 하니?"라며 뭐라했는데, 많이들 이용해주어서 기뻤다. 역시 우리나라 사람들은 뭐든 지는 것을 싫어한다. 경쟁심을 자극하는 서비스는 성공할 확률이 높은 것 같다.

4\. Google Adsense 광고를 신청해두었는데, 트래픽이 다 죽을 때까지 광고가 달리지 않았다. 만약 광고가 달렸다면 적어도 도메인 구매 비용정도는 메꾸었을텐데 참 아쉽다.

5\. 사람들이 정말 글을 안 읽는다. 개인 랭킹 화면에서 아무 이름이나 클릭하면 학교 랭킹으로 돌아간다고 써두었는데 그걸 모르는 사람들이 많더라. **앞으로 UI를 만들 때는 과할 정도로 친절해야겠다고 느꼈다.**

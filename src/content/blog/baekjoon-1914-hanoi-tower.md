---
title: "백준 1914 : 하노이 탑 (C++) / C++에서 long long보다 큰 정수를 다루는 법"
description: "C++에서 long long보다 큰 정수를 다루어야 할 때, 정수를 벡터로 표현하는 방법을 익힐 수 있었다."
pubDate: "2024-03-23T14:41:42+09:00"
updatedDate: "2024-03-23T14:42:28+09:00"
---

※ 주의 : 이 글은 재귀를 이용한 하노이 탑 해결 알고리즘이 아닌, C++에서 자료형의 범위를 넘어가는 큰 수를 다루는 방법을 중점적으로 다루고 있습니다. 재귀를 이용한 하노이 탑 해결 알고리즘이 궁금하다면 다른 블로그의 글을 참고하시기 바랍니다.

> [**문제**](https://www.acmicpc.net/problem/1914 "문제 페이지")\
> 세 개의 장대가 있고 첫 번째 장대에는 반경이 서로 다른 n개의 원판이 쌓여 있다. 각 원판은 반경이 큰 수서대로 쌓여있다. 이제 수도승들이 다음 규칙에 따라 첫 번째 장대에서 세 번째 장대로 옮기려 한다.\
> 1\. 한 번에 한 개의 원판만을 다른 탑으로 옮길 수 있다.\
> 2\. 쌓아 놓은 원판은 항상 위의 것이 아래의 것보다 작아야 한다.\
> 이 작업을 수행하는데 필요한 이동 순서를 출력하는 프로그램을 작성하라. 단, 이동 횟수는 최소가 되어야 한다.\
> \
> **입력**\
> 첫째 줄에 첫 번째 장대에 쌓인 원판의 개수 N(1 ≤ N ≤ 100)이 주어진다.\
> \
> **출력**\
> 첫째 줄에 옮긴 횟수 K를 출력한다.\
> N이 20 이하인 입력에 대해서는 두 번째 줄부터 수행 과정을 출력한다. 두 번째 줄부터 K개의 줄에 걸쳐 두 정수 A B를 빈칸을 사이에 두고 출력하는데, 이는 A번째 탑의 가장 위에 있는 원판을 B번째 탑의 가장 위로 옮긴다는 뜻이다. N이 20보다 큰 경우에는 과정은 출력할 필요가 없다.

처음에는 단순한 재귀 문제로 생각하여 아래와 같은 코드를 작성하여 제출하였다.

```cpp
#include <iostream>
using namespace std;

void Hanoi(int n, int from, int drop, int to) {
	if(n == 1) {
		cout<<from<<" "<<to<<"\n";
		return;
	}

	Hanoi(n - 1, from, to, drop);
	cout<<from<<" "<<to<<"\n";
	Hanoi(n - 1, drop, from, to);
}

int main(void) {
	int N; cin>>N;

	int count = 0;
	for(int i = 0; i < N; i++) {
		count = (count * 2) + 1;
	}
	cout<<count<<"\n";

	if(N <= 20) {
		Hanoi(N, 1, 2, 3);
	}
	return 0;
}
```

그러나 제출 결과 오답이었다. 아래 반례를 보자.

> 입력 1: 30\
> 출력 1 : 1073741823\
> \
> 입력 2 : 31\
> 출력 2 : 2147483647\
> \
> 입력 3 : 32\
> 출력 3 : **-1**

출력을 담는 count 변수의 자료형이 int형이기 때문에 너무 큰 출력값을 저장하지 못하고 오버플로우가 발생한 모습이다.

> int형의 범위 : -2<sup>31</sup> ~ (2<sup>31</sup> - 1) (-2,147,483,648 ~ 2,147,483,647)

이를 해결하기 위해 count 변수의 자료형을 더 큰 숫자를 담을 수 있는 long long 자료형으로 바꾸어 실행해본다.

> 입력 1 : 32\
> 출력 1 : 4294967295\
> \
> 입력 2 : 62\
> 출력 2 : 4611686018427387903\
> \
> 입력 3 : 63\
> 출력 3 : 9223372036854775807\
> \
> 입력 4 : 64\
> 출력 4 : **-1**

역시나 오버플로우가 발생한다.

> long long형의 범위 : -2<sup>63</sup> ~ (2<sup>63</sup> - 1) (-9,223,372,036,854,775,808 ~ 9,223,372,036,854,775,807)

그런데 잘 생각해 보니 count 변수는 실행된 횟수를 담는 변수이기 때문에 음수가 될 일이 없다. long long 자료형은 부호가 있는 자료형이기 때문에 우리의 소중한 메모리의 절반을 사용될 일 없는 음수를 표현하는 데 사용하고 있는 것이다. 따라서 마지막으로 우리가 알고 있는 부호 없는 정수 자료형 중 가장 큰 unsigned long long을 사용하여 실행해 본다.

> 입력 1 : 64\
> 출력 1 : 18446744073709551615\
> \
> 입력 2 : 65\
> 출력 2 : **18446744073709551615**\
> \
> 입력 3 : 66\
> 출력 3 : **18446744073709551615**\
> \
> 입력 4 : 100\
> 출력 4 : **18446744073709551615**

비상!!! 알고 있는 가장 큰 정수 자료형을 사용했음에도 오버플로우가 발생했다. 이 정도 큰 수는 정수 자료형으로 다룰 수 없다는 것을 깨닫고 다른 방법을 생각해 본다.

> unsigned long long형의 범위 : 0 ~ 2<sup>64</sup> (0 ~ 18,446,744,073,709,551,615)

내가 생각한 방법은 이 수를 벡터에 담는 것이다. 예를 들어 정수 147,573,952,589,676,412,927를 표현하고 싶다면 다음과 같이 저장하는 것이다.

```cpp
vector<int> count = { 1, 4, 7, 5, 7, 3, 9, 5, 2, 5, 8, 9, 6, 7, 6, 4, 1, 2, 9, 2, 7 };
```

위의 방법을 사용하면, 벡터의 원소 개수는 메모리가 허용하는 한 무제한 늘어날 수 있기 때문에 아무리 큰 정수라도 모두 표현할 수 있다. 그러나 내가 작성한 알고리즘에서는 입력이 1 늘어날 때마다 count에 2를 곱하고 1을 더해야 하기 때문에 이 연산을 위한 별도의 코드를 작성하여야 한다.

```cpp
//변경 전
int count = 0;
for(int i = 0; i < N; i++) {
	count = (count * 2) + 1;
}
cout<<count<<"\n";

//변경 후
vector<int> count = {0};
for(int i = 0; i < N; i++) {
	mul2(count);
	plus1(count);
}
printCount(count);
```

일단 위와 같이 일단 벡터를 사용해 count의 값을 저장해 준다. 그리고 벡터로 표현된 정수의 계산을 위한 mul2 함수와 plus1 함수를 따로 구현하였다.

```cpp
void mul2(vector<int> &count) {
	int carry = 0;
	for(int digit = count.size() - 1; digit >= 0; digit--) {
		count[digit] = (count[digit] * 2) + carry;
		carry = 0;

		if(digit == 0 && count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			count.insert(count.begin(), 1);
		} else if(count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			carry = 1;
		}
	}
}
```

mul2 함수의 동작은 다음과 같다.

> 1\) 맨 마지막 자리에서부터 2를 곱한다.\
>  1-1) 만약 뒷자리에서 올림값(carry)이 존재했다면 이를 더해준다.\
>  1-2) 올림값을 더한 뒤에는 올림값을 0으로 초기화해 준다.\
> 2\) 만약 2를 곱한 값이 10을 넘지 않는다면 다음 자릿수로 넘어가 반복한다.\
> 3\) 만약 2를 곱한 값이 10을 넘는다면 일의 자릿수만 취하고, 나머지 값은 다음 자릿수에 올림값으로 넘긴다.\
>  3-1) 만약 맨 앞자리 수가 10이 넘어 더 이상 넘길 다음 자릿수가 없다면, 일의 자릿수만 취하고 올림값을 앞에 새 원소로 삽입한다.

예시를 통해 mul2 함수의 동작을 더 자세히 알아보자.

1. mul2( { 9, 8, 7, 2 } );\
   9872에 2를 곱하는 예시이다.
2. { 9, 8, 7, **4** }\
   맨 마지막 자리에 2를 곱한다. 값이 10을 넘지 않았으므로 다음 자리로 넘어간다.
3. { 9, 8, **14**, 4 }\
   세 번째 자리에 2를 곱한다. 값이 10을 넘었다.
4. { 9, 8 (**+ 1)**, **4**, 4 }\
   일의 자릿수만 취하고, 나머지 값은 두 번째 자리에 올림값으로 넘겼다.
5. { 9, **16** (+ 1), 4, 4 }\
   두 번째 자리에 2를 곱한다.
6. { 9, **17**, 4, 4 }\
   뒷자리에서 올라온 올림값을 더해준다. 값이 10을 넘었다.
7. { 9 **(+ 1)**, **7**, 4, 4 }\
   일의 자릿수만 취하고, 나머지 값은 첫 번째 자리에 올림값으로 넘겨준다.
8. { **19**, 7, 4, 4 }\
   첫 번째 자리에 2를 곱하고 올림수를 더한다. 값이 10을 넘었고, 넘길 다음 자리가 없다.
9. { **1**, **9**, 7, 4, 4 }\
   일의 자릿수만 취하고, 올림값을 앞에 새 원소로 삽입한다.

답이 맞는지 확인해 보자. (9872 x 2 = 19744) 완벽하다! 이렇게 벡터로 표현된 정수에 2를 곱하는 함수를 구현했다.

다음은 비슷한 방법으로 구현한 plus1 함수이다. 직접 함수의 동작을 분석해 보자.

```cpp
void plus1(vector<int> &count) {
	int carry = 0;
	for(int digit = count.size() - 1; digit >= 0; digit--) {
		count[digit] = count[digit] + 1 + carry;
		carry = 0;

		if(digit == 0 && count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			count.insert(count.begin(), 1);
		} else if(count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			carry = 1;
		} else {
			break;
		}
	}
}
```

※ 힌트 : 곱하기는 모든 자리에 다 곱하여야 하지만, 더하기를 할 때는 마지막 자리에만 더하면 된다. 즉, 올림수가 발생하지 않으면 그대로 함수를 종료하면 된다.

plus1 함수의 동작을 직접 분석해 보았는가? 그렇다면 마지막으로 작동하는 전체 정답 코드를 보이겠다.

```cpp
#include <iostream>
#include <vector>
using namespace std;

void Hanoi(int n, int from, int drop, int to) {
	if(n == 1) {
		cout<<from<<" "<<to<<"\n";
		return;
	}

	Hanoi(n - 1, from, to, drop);
	cout<<from<<" "<<to<<"\n";
	Hanoi(n - 1, drop, from, to);
}

void mul2(vector<int> &count) {
	int carry = 0;
	for(int digit = count.size() - 1; digit >= 0; digit--) {
		count[digit] = (count[digit] * 2) + carry;
		carry = 0;

		if(digit == 0 && count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			count.insert(count.begin(), 1);
		} else if(count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			carry = 1;
		}
	}
}

void plus1(vector<int> &count) {
	int carry = 0;
	for(int digit = count.size() - 1; digit >= 0; digit--) {
		count[digit] = count[digit] + 1 + carry;
		carry = 0;

		if(digit == 0 && count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			count.insert(count.begin(), 1);
		} else if(count[digit] >= 10) {
			count[digit] = count[digit] % 10;
			carry = 1;
		} else {
			break;
		}
	}
}

void printCount(vector<int> &count) {
	for(auto num : count) {
		cout<<num;
	}
	cout<<"\n";
}

int main(void) {
	int N; cin>>N;

	vector<int> count = {0};
	for(int i = 0; i < N; i++) {
		mul2(count);
		plus1(count);
	}
	printCount(count);

	if(N <= 20) {
		Hanoi(N, 1, 2, 3);
	}
	return 0;
}
```

위와 같이 문제를 풀 수 있었다.

## **배울 수 있었던 점**

- C++에서 long long보다 큰 정수를 다루어야 할 때, 정수를 벡터로 표현하는 방법을 익힐 수 있었다.

## **더 생각해 볼 점**

- 이 문제에서는 문제의 목적에 따라 **2를 곱하는 함수**와 **1을 더하는 함수**만 구현하였다. 이를 일반화하여, 원하는 숫자를 더하거나 곱하거나 빼거나 나누는 함수도 만들 수 있지 않을까?
- long long보다 큰 정수를 벡터가 아니라 문자열로 다루는 방법도 생각해 볼 수 있지 않을까?

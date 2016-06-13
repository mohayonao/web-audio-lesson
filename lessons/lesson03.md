# lesson03

このページではオーディオサンプルを使用する方法について説明します。

Web Audio APIでオーディオサンプルを再生するには2つのオブジェクトを使用します。ひとつはオーディオサンプルのデータを保持する[`AudioBuffer`](http://g200kg.github.io/web-audio-api-ja/#AudioBuffer)で、もうひとつは`AudioBuffer`を再生するためのオーディオノード[`AudioBufferSourceNode`](http://g200kg.github.io/web-audio-api-ja/#AudioBufferSourceNode)です。

## オーディオサンプルの読み込み

オーディオサンプルのデータを保持する`AudioBuffer`は自分で生成することもできますが、ファイルを読み込んで変換（デコード）して生成するのがより簡単です。

まず、JavaScriptでファイルを読み込む方法について説明します。

JavaScriptでファイルを読み込むには[`XMLHttpRequest`](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest)を使用します。`XMLHttpRequest`はブラウザとサーバー間の非同期通信を管理します。「非同期」とはリクエストの送信後、ブラウザが処理完了を待つために停止や保留する必要がないことを意味します。

`XMLHttpRequest`を使用してバイナリファイルを読み込むには次のような関数を定義すると便利に使えます。

```js
function loadFile(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function() {
    if (xhr.response) {
      callback(xhr.response);
    }
  };

  xhr.send();  
}
```

この`loadFile()`関数は2番目の引数が「コールバック関数」になっています。コールバック関数とはある非同期処理が終わったときに呼び出される関数のことです。非同期関数は処理の結果を戻り値にすることができません。ですから、処理結果を受け取るコールバック関数を経由して全体の処理の流れを構成します。

`loadFile()`関数は次のように使います。プログラムの実行順序に注意してください。

```js
// (1) 読み込み処理を開始
loadFile("amen.wav", function(data) {
  // (3) 読み込みが完了したらここが呼び出される
  console.log("loaded!");
});

// (2) 読み込みが終わるより先にここが実行される
console.log("loading...");
```
> #### 補足: Same-Origin Policyについて
> `XMLHttpRequest`を利用したファイル読み込みについて説明しました。ですが、URLさえ分かればどのファイルでも読み込んで使用できるわけではありません。
> ブラウザでは、あるWebサイトのリソースが別の悪意あるWebサイトで悪用されるのを防ぐために、[Same-Origin Policy](https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy)（同一生成元ポリシー）が適用されます。同一生成元ポリシーとは、外部（異なる源泉）からはデータにアクセスできないというセキュリティ上の考え方です。つまり、基本的に読み込めるファイルは自分で用意して同じサイト内に設置してあるファイルだけになります。ただし、リソース提供元で特定の設定をすることで制限を緩和する[Cross-Origin Resource Sharing](https://developer.mozilla.org/ja/docs/HTTP_access_control)という仕組みもあります。

## オーディオサンプルへの変換

読み込んだファイルはオーディオコンテキストの[`decodeAudioData()`](http://g200kg.github.io/web-audio-api-ja/#widl-BaseAudioContext-decodeAudioData-Promise-AudioBuffer--ArrayBuffer-audioData-DecodeSuccessCallback-successCallback-DecodeErrorCallback-errorCallback)メソッドを使用して`AudioBuffer`へと変換（デコード）します。

`decodeAudioData()`メソッドも非同期で処理されるため、変換結果は2番目の引数に指定するコールバック関数で受け取ります。3番目の引数には変換に失敗した場合のコールバック関数を指定できますが、この引数は省略することもできます。変換された`AudioBuffer`はオーディオコンテキストのサンプルレートに合わせてリサンプリングされます。

```js
audioContext.decodeAudioData(data, function(audioBuffer) {
  // デコードに成功したときに呼ばれる
}, function() {
  // デコードに失敗したときに呼ばれる（省略可能）
});
```

Web Audio APIのアプリケーションではファイルを読み込んで変換までをひとまとめにした方が便利ですので、2つを組み合わせた次のような関数を定義すると良いです。

```js
function fetchAsAudioBuffer(audioContext, url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function() {
    if (xhr.response) {
      audioContext.decodeAudioData(xhr.response, callback);
    }
  };

  xhr.send();
}
```

`fetchAsAudioBuffer()`関数は次のように使用します。

```js
// 読み込んだAudioBufferを格納するための配列
var instruments = [];

fetchAsAudioBuffer(audioContext, "amen.wav", function(audioBuffer) {
  // 読み込んだAudioBufferを代入
  instruments[0] = audioBuffer;
});
```

_このテキストではあらかじめ4つのオーディオサンプルを読み込んであり、`instruments`という配列に代入されています。_

### AudioBufferのパラメーター

| 名前             | データ型 | 説明                   |
|------------------|----------|------------------------|
| sampleRate       | number   | サンプルレート         |
| length           | number   | バッファーのサンプル数 |
| duration         | number   | バッファーの時間（秒） |
| numberOfChannels | number   | バッファーのチャネル数 |

`AudioBuffer`のデータは`getChannelData()`メソッドを使って取得することができます。

```js
audioBuffer.getChannelData(0);
```

## オーディオサンプルの再生

`AudioBuffer`は`AudioBufferSourceNode`を使って再生します。

### AudioBufferSourceNodeのパラメーター

| 名前         | データ型    | 説明                   |
|--------------|-------------|------------------------|
| buffer       | AudioBuffer | 再生するバッファー     |
| playbackRate | AudioParam  | 再生速度               |
| loop         | boolean     | ループのON/OFF         |
| loopStart    | number      | ループの開始位置（秒） |
| loopEnd      | number      | ループの終了位置（秒） |

`AudioBufferSourceNode`は`AudioBuffer`インスタンスを再生するためのオーディオノードです。`OscillatorNode`と同じように「音源」に分類されます。`start()`メソッドで再生を開始します。

次の例は`AudioBufferSourceNode`を使ってオーディオサンプルを再生するコードです。
`AudioBufferSourceNode`はオーディオサンプルの最後まで再生すると自動的に停止するので、 `stop()`メソッドを呼び出す必要はありません。

```js
/* editor */
function synth(t0, audioBuffer) {
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = audioBuffer;
  bufferSource.start(t0);
  bufferSource.connect(audioContext.destination);
}

synth(audioContext.currentTime, instruments[0]);
```

## 再生位置の指定

`AudioBufferSourceNode`では`start()`メソッドの2番目と3番目の引数で再生位置と再生時間をそれぞれ秒単位で指定することができます。これはオーディオサンプルの頭出しや、オーディオスライスに使えます。

```js
/* editor */
function synth(t0, audioBuffer) {
  var dur = audioBuffer.duration / 5;
  var t1 = t0 + dur;
  var startTime = Math.floor(Math.random() * 5) * dur;
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = audioBuffer;
  bufferSource.start(t0, startTime, dur);
  bufferSource.connect(audioContext.destination);
}

synth(audioContext.currentTime, instruments[1]);
```

## ループ

オーディオサンプルをループ再生するには`loop`パラメーターに`true`を設定します。さらにループ開始位置を`loopStart`、ループ終了位置を`loopEnd`で指定することができます。ループの開始位置・終了位置を指定しなかった場合は、オーディオサンプル全体をループします。`start()`メソッドはループの開始位置とは独立して設定できます。

```js
/* editor */
function synth(t0, audioBuffer) {
  var t1 = t0 + 10;
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = audioBuffer;
  bufferSource.loop = true;
  bufferSource.loopStart = 1.71;
  bufferSource.loopEnd = 3.43;
  bufferSource.start(t0);
  bufferSource.connect(audioContext.destination);
}

synth(audioContext.currentTime, instruments[0]);
```

## 再生速度

`playbackRate`プロパティでは再生速度を比率で設定できます。たとえば、2を設定すると再生速度が2倍となり、ピッチも2倍となります。

```js
/* editor */
function synth(t0, pitch, audioBuffer) {
  var dur = audioBuffer.duration / 5;
  var t1 = t0 + dur;
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = audioBuffer;  
  bufferSource.playbackRate.value = Math.pow(2, pitch/12);
  bufferSource.start(t0, 0, dur);
  bufferSource.connect(audioContext.destination);
}

var pitch = Math.floor(Math.random() * 24) - 12;

synth(audioContext.currentTime, pitch, instruments[1]);
```

半音単位の数値を比率へと変換するには次の関数が使えます。

```js
function midiratio(midi) {
  return Math.pow(2, midi / 12);
}
```

> #### 補足: Fetch APIそしてPromise
> このページではファイルの読み込みに`XMLHttpRequest`とコールバック関数を使う方法を紹介しました。
> もう少しモダンな別の方法として、`XMLHttpRequest`の代わりに[`Fetch API`](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)、コールバック関数の代わりに[`Promise`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)を使う方法があります。

## 課題

[lesson03](quizzes/lesson03) / [解答例](quizzes/lesson03/answer.html)

タップすると音の出るサンプラーのウェブオーディオアプリケーションです。

1. ファイルを読み込んでデコードする`fetchAsAudioBuffer()`関数を実装する
2. `fetchAsAudioBuffer()`関数を使って次のオーディオサンプルを読み込む
  - `"assets/piano-high.wav"`
  - `"assets/piano-mid.wav"`
  - `"assets/piano-low.wav"`
3. 読み込んだオーディオサンプルは`instruments[]`配列に代入する

---
更新日付：2016-06-13
- 2016-06-13：テーブルの崩れを修正
- 2016-06-10：初稿

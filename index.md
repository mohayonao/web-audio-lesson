# web audio lesson

## このテキストについて

このテキストはWeb Audio APIの基礎から応用までを実践的な視点でざっくりと説明したものです。Web Audio APIに興味のある読者を対象にしていますが、JavaScriptの高度な知識は必要ありません。ただし、JavaScriptの基本的な構文などについては既に学習していることを前提にしています。

### テキストで扱うこと

- Web Audio APIの基礎的な使用方法
- Web Audio APIの実践的な使用例
- 外部アプリケーションとの連携の仕組み

### テキストで扱わないこと

- JavaScriptの基本
- ユーザーインターフェース
- サーバープログラミングの詳細
- Web Audio APIの高度な機能（チャネル操作や`ScriptProcessorNode`など）

### テキストで使用するJavaScriptの構文

- 変数の宣言、代入
- 関数の定義、呼び出し
- 配列・オブジェクトの生成、値の取得
- if文
- forループ

### 課題のコードを読み解くのに追加で必要な知識

- イベント・イベントハンドラ
- 配列操作メソッド（`map`や`forEach`、`split`など）

### サーバーのコードを読み解くのに追加で必要な知識

- Node.js / npm
- ES2015
- WebSocket（socket.io）

## サンプルコードの実行

テキストのサンプルコードはその場で編集や実行ができます。理解するための補助として使ってください。

- <button class="btn btn-xs btn-default editor-btn">RUN</button> コードを実行
- <button class="btn btn-xs btn-default editor-btn">STOP</button> コードの実行を停止
- <button class="btn btn-xs btn-default editor-btn">REVERT</button> コードを元の状態に戻す

```js
/* editor */
function synth(t0) {
  var t1 = t0 + 0.100;
  var t2 = t1 + 0.650;
  var oscillator = audioContext.createOscillator();
  var gain = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1000, t0);
  oscillator.frequency.setValueAtTime(1320, t1);
  oscillator.start(t0);
  oscillator.stop(t2);
  oscillator.connect(gain);

  gain.gain.setValueAtTime(0.25, t0);
  gain.gain.setValueAtTime(0.25, t1);
  gain.gain.linearRampToValueAtTime(0, t2);
  gain.connect(audioContext.destination);
}

synth(audioContext.currentTime);
```

## オンライン版とオフライン版

このテキストにはGitHub Pagesで提供されているオンライン版と、ソースコードをダウンロードして実行するオフライン版があります。
オフライン版の導入方法はリポジトリを参考にしてください。

- [mohayonao/web-audio-lesson](https://github.com/mohayonao/web-audio-lesson)

## 課題の進め方

オフライン版には穴埋め形式の課題を用意しています。課題では簡単なウェブアプリケーションを実装します。独立したひとつのアプリケーションになっているので、断片的なサンプルコードではつかみにくい全体的なプログラムの感覚や理解を深めることができます。課題は各レッスンごとに`quizzes/lesson**`フォルダに設置しています。`quiz.js`は不完全なプログラムですので、そのレッスンの内容を参考にしてプログラムを完成させてください。

```
quizzes/
  lession01/
    quiz.js    // このファイルを編集する
    answer.js  // 解答例
```

## テキストのソースコード・ライセンス

この書籍に登場するサンプルコード、また文章は全てGitHubから取得することができます。

- [mohayonao/web-audio-lesson](https://github.com/mohayonao/web-audio-lesson)

サンプルコードのライセンスはMITライセンスで、文章はCC-BY-NCで利用することができます。

## 意見や疑問点

意見や疑問点がある場合はGitHubに直接Issueとして立てることができます。

- [Issues · mohayonao/web-audio-lesson](https://github.com/mohayonao/web-audio-lesson/issues)

誤植や不適切な表現などがあればGitHubで [Pull Requests](https://github.com/mohayonao/web-audio-lesson/pulls) も歓迎しています。

## 参考サイト

<dl>
  <dt>[Web Audio API Specification](https://www.w3.org/TR/webaudio/) （[日本語訳](http://g200kg.github.io/web-audio-api-ja/)）</dt>
  <dd>Web Audio APIの仕様</dd>
  <dt>[Web Audio API解説](http://www.g200kg.com/jp/docs/webaudio/)</dt>
  <dd>Web Audio APIの解説サイト - 情報量が多く、リファレンス等を参考にした</dd>
  <dt>[WebAudio School](http://mmckegg.github.io/web-audio-school/)</dt>
  <dd>Web Audio APIの自習型サイト - 学習の進め方やサンプルコードを参考にした</dd>
  <dt>[Web Audio API Ebook](https://www.oreilly.co.jp/books/9784873116419/)</dt>
  <dd>Web Audio APIについての入門用書籍</dd>
</dl>

## コミュニティ

<dl>
  <dt>[Web Music Developers JP](https://groups.google.com/forum/#!forum/web-music-developers-jp)</dt>
  <dd>ブラウザ上で音楽制作する環境を開発する人向けのメーリングリスト</dd>
  <dt>[webaudio slack](https://web-audio-slackin.herokuapp.com/)</dt>
  <dd>A Slack for discussing Web Audio</dd>
</dl>

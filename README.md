# UUID-Generator

ブラウザ上で動作するシンプルなUUIDジェネレーターです。  
指定した個数のUUIDv4（ランダム生成）を即座に生成・表示します。

## 機能

- UUIDv4（ランダム）を生成  
- 生成数を指定可能（1〜100個）  
- 追加ライブラリ不要、単一HTMLファイルで動作

## 使い方

[GitHub Pages](https://bambikun.github.io/UUID-Generator/)で公開中のURLにアクセスして使えます。

メインではUUID v4を使用しています。

## ライセンス

MIT License

---

UUIDv1: 時間＋MACアドレスベースで生成、生成時刻や機器情報が含まれる。

UUIDv2: DCEセキュリティ版でPOSIX UID/GID情報を埋め込む、ほとんど使われない。

UUIDv3: 名前空間＋名前文字列をMD5でハッシュして決定論的に生成。

UUIDv4: 完全ランダム（乱数）生成で最も広く利用される。

UUIDv5: 名前空間＋名前文字列をSHA-1でハッシュして決定論的に生成。

---

質問や機能追加のリクエストはIssueにてお気軽にどうぞ。

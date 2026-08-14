# WEB-XR.studio

株式会社 WEB-XR.studio のコーポレートサイト。Web制作・システム開発・アプリ開発・AIソリューションを紹介する、日本語のライトテーマのサイトです。

- **公開サイト** — 会社概要 / サービス / 制作実績 / クライアントの声 / チーム / FAQ / お問い合わせ の7セクション
- **管理ダッシュボード** — すべてのコンテンツを追加・編集・削除できるパスワード保護の管理画面（`/admin`）
- **担当チームの判定** — サイトのコンテンツ（RAG）と Groq を活用し、相談内容から担当チームと近い実績を案内する機能（トップページ）

## 技術スタック

| 項目                  | 採用技術                                                                         |
| --------------------- | -------------------------------------------------------------------------------- |
| フレームワーク        | Next.js 16（App Router）+ TypeScript                                             |
| スタイリング          | Tailwind CSS v4（ライトテーマ）                                                  |
| データベース          | Neon Postgres + `pgvector`                                                       |
| ORM                   | Drizzle ORM                                                                      |
| 認証                  | パスワード + JWT（`jose`）を httpOnly Cookie に保存、Proxy で保護                |
| AI判定                | Groq SDK（`llama-3.3-70b-versatile`）                                            |
| 埋め込み（Embedding） | `@xenova/transformers`（`all-MiniLM-L6-v2`、384次元、ローカル生成・追加API不要） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、値を入力します。

```bash
cp .env.example .env.local
```

| 変数             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| `DATABASE_URL`   | Neon のプール接続文字列（ダッシュボード → Connection Details） |
| `ADMIN_PASSWORD` | 管理画面のログインパスワード                                   |
| `AUTH_SECRET`    | セッションJWTの署名鍵（`openssl rand -base64 32` で生成）      |
| `GROQ_API_KEY`   | Groq の APIキー（https://console.groq.com/keys）               |
| `GROQ_MODEL`     | （任意）使用するGroqモデル。既定は `llama-3.3-70b-versatile`   |

画像とお問い合わせの添付は Cloudinary に保存するため、以下も設定します。未設定の場合、画像のアップロードはできません。

| 変数                                                                     | 説明                                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary のダッシュボードで確認できます                              |
| `SLACK_WEBHOOK_URL`                                                      | （任意）お問い合わせを Slack に流します。未設定なら通知しないだけです  |
| `NEXT_PUBLIC_SITE_URL`                                                   | Slack 通知内の「管理画面で開く」リンク先。**公開前に実際のドメインへ** |

### 3. データベースの準備

`pgvector` 拡張の有効化とスキーマの適用、初期データ（プレースホルダー）の投入、RAGインデックスの構築を行います。

```bash
npm run setup
```

これは以下と同じです。

```bash
npm run db:migrate   # pgvector 有効化 + スキーマ push
npm run db:seed      # プレースホルダー投入 + RAGインデックス構築
```

> **メモ:** 初回の `db:seed` および担当チーム判定の初回実行時に、埋め込みモデル（約90MB）がローカルにダウンロードされます。以降はキャッシュから読み込まれ、外部APIコストは発生しません。

### 4. 開発サーバー起動

```bash
npm run dev
```

- 公開サイト: http://localhost:3000
- 管理画面: http://localhost:3000/admin （`ADMIN_PASSWORD` でログイン）

## 主なスクリプト

| コマンド                          | 内容                          |
| --------------------------------- | ----------------------------- |
| `npm run dev`                     | 開発サーバー                  |
| `npm run build` / `npm run start` | 本番ビルド / 起動             |
| `npm run typecheck`               | 型チェック                    |
| `npm run db:migrate`              | pgvector有効化 + スキーマ適用 |
| `npm run db:seed`                 | 初期データ投入 + RAG構築      |
| `npm run db:studio`               | Drizzle Studio（DB GUI）      |
| `npm run setup`                   | migrate + seed をまとめて実行 |

## 使い方

### コンテンツの編集

管理画面（`/admin`）の左メニューから各セクションを選び、項目を追加・編集・削除できます。保存すると公開サイトのキャッシュが破棄され、次のアクセスから新しい内容になります。AI判定の知識（RAGインデックス）も保存時に自動で更新されます。

> **メモ:** 以前は接続を張ったまま更新を待つ方式（SSE）でしたが、待っている間もサーバーの実行時間として課金され続けるため取りやめました。お問い合わせの新着は、管理画面を開いている間だけ30秒ごとに確認します。

### お問い合わせ

公開サイトの「お問い合わせ」フォームから届いた内容は `/admin/contacts` に一覧表示され、対応済みマークや削除ができます。複数選択してまとめて削除することもできます。Slack の Webhook を設定しておくと、届いた内容がそのまま Slack にも流れます。

### 担当チームの判定

トップページの「アイデアを入力する」ボタンから、つくりたいものを書くと担当チームと近い実績を案内します。判定はサイトのコンテンツのみを根拠に行い、制作・開発以外の相談には答えません。

## アーキテクチャ

```
src/
  app/
    (site)/              公開サイト（レイアウト + トップページ）
    admin/               管理画面（login / dashboard / [section] / contacts）
    api/
      auth/              ログイン・ログアウト
      admin/             コンテンツCRUD（Proxyで保護）
      match/             RAG + Groq の担当チーム判定
      contact/           お問い合わせ送信
  components/            UI / sections / layout / admin / brand
  db/                    Drizzle schema・接続・migrate・seed
  lib/                   auth / content / embeddings / rag / groq / sections / slack
  proxy.ts               管理エリアの認証ガード（Next.js 16 の Proxy）
public/                  地図・沿革・チームなどの画像
```

## デプロイ

Vercel などにデプロイする場合は、上記の環境変数を設定してください。`@xenova/transformers` は Node.js ランタイムで動作するため、埋め込みを扱う API ルート（`/api/match`, `/api/admin/*`）は Node ランタイムで実行されます（各ルートで `runtime = "nodejs"` を指定済み）。

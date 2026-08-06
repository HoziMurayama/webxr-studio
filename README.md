# WEB-XR.studio

株式会社 WEB-XR.studio のコーポレートサイト。Web制作・システム開発・アプリ開発・AIソリューションを紹介する、日本語のライトテーマのサイトです。

- **公開サイト** — 会社概要 / サービス / 制作実績 / クライアントの声 / チーム / FAQ / お問い合わせ の7セクション
- **管理ダッシュボード** — すべてのコンテンツを追加・編集・削除できるパスワード保護の管理画面（`/admin`）
- **AIアシスタント** — サイトのコンテンツ（RAG）と Groq を活用した、右下に常駐する問い合わせボット

## 技術スタック

| 項目 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router）+ TypeScript |
| スタイリング | Tailwind CSS v4（ライトテーマ） |
| データベース | Neon Postgres + `pgvector` |
| ORM | Drizzle ORM |
| 認証 | パスワード + JWT（`jose`）を httpOnly Cookie に保存、Proxy で保護 |
| AIチャット | Groq SDK（`llama-3.3-70b-versatile`） |
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

| 変数 | 説明 |
| --- | --- |
| `DATABASE_URL` | Neon のプール接続文字列（ダッシュボード → Connection Details） |
| `ADMIN_PASSWORD` | 管理画面のログインパスワード |
| `AUTH_SECRET` | セッションJWTの署名鍵（`openssl rand -base64 32` で生成） |
| `GROQ_API_KEY` | Groq の APIキー（https://console.groq.com/keys） |
| `GROQ_MODEL` | （任意）使用するGroqモデル。既定は `llama-3.3-70b-versatile` |

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

> **メモ:** 初回の `db:seed` およびAIアシスタントの初回応答時に、埋め込みモデル（約90MB）がローカルにダウンロードされます。以降はキャッシュから読み込まれ、外部APIコストは発生しません。

### 4. 開発サーバー起動

```bash
npm run dev
```

- 公開サイト: http://localhost:3000
- 管理画面: http://localhost:3000/admin （`ADMIN_PASSWORD` でログイン）

## 主なスクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` / `npm run start` | 本番ビルド / 起動 |
| `npm run typecheck` | 型チェック |
| `npm run db:migrate` | pgvector有効化 + スキーマ適用 |
| `npm run db:seed` | 初期データ投入 + RAG構築 |
| `npm run db:studio` | Drizzle Studio（DB GUI） |
| `npm run setup` | migrate + seed をまとめて実行 |

## 使い方

### コンテンツの編集

管理画面（`/admin`）の左メニューから各セクションを選び、項目を追加・編集・削除できます。変更は公開サイトに即時反映され、AIアシスタントの知識（RAGインデックス）も自動で更新されます。全体を作り直したい場合は「AIインデックス」ページの再構築ボタンを使用します。

### お問い合わせ

公開サイトの「お問い合わせ」フォームから届いた内容は `/admin/contacts` に一覧表示され、対応済みマークや削除ができます。

### AIアシスタント

公開サイト右下のチャットから、サービス内容・実績・料金の目安などをその場で確認できます。回答はサイトのコンテンツのみを根拠に生成され、情報がない場合はお問い合わせを案内します。

## アーキテクチャ

```
src/
  app/
    (site)/              公開サイト（レイアウト + トップページ）
    admin/               管理画面（login / dashboard / [section] / contacts / ai）
    api/
      auth/              ログイン・ログアウト
      admin/             コンテンツCRUD + reindex（Proxyで保護）
      chat/              RAG + Groq のチャット
      contact/           お問い合わせ送信
  components/            UI / sections / layout / admin / ai / brand
  db/                    Drizzle schema・接続・migrate・seed
  lib/                   auth / content / embeddings / rag / groq / sections
  proxy.ts               管理エリアの認証ガード（Next.js 16 の Proxy）
public/                  ロゴ資産・イントロアニメーション（xr-logo-intro.js）
```

## デプロイ

Vercel などにデプロイする場合は、上記の環境変数を設定してください。`@xenova/transformers` は Node.js ランタイムで動作するため、埋め込みを扱う API ルート（`/api/chat`, `/api/admin/*`）は Node ランタイムで実行されます（各ルートで `runtime = "nodejs"` を指定済み）。

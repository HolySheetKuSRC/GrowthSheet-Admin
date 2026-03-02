# GrowthSheet Admin

This is the **GrowthSheet Admin Dashboard**, built with [Next.js](https://nextjs.org).  
It is used for managing sellers, sheets, and internal platform operations.

---

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the application by modifying files inside the `app/` directory. The page auto-updates as you edit the files.

---

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Update the value according to your backend environment.

---

## Project Structure

```
app/                Application routes (App Router)
components/         Reusable UI components
lib/                API utilities (Axios configuration)
public/             Static assets
```

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

---

## Deployment

The application can be deployed on any Node.js hosting environment.

Recommended platforms:
- [Vercel](https://vercel.com/)
- Docker-based environments
- Cloud VM (AWS, GCP, Azure)

For Vercel deployment:
1. Connect the repository
2. Configure environment variables
3. Deploy

---

## License

Internal administrative system for GrowthSheet platform.
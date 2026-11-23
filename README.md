SetReady
SetReady is an online equipment rental marketplace for filmmakers, photographers, and production teams. Customers can find gear from local owners, choose rental dates, and book online. Owners can list equipment and track their rentals, while administrators manage listings, users, and bookings.
- Live website: setready-client.vercel.app
- Live API: setready-server.onrender.com
- Repositories: Client · Server
Key features
- Equipment catalog with server-side search, filters for category, rental type, price and availability, sorting, and pagination.
- Customer dashboard with favorites, rental history, payment and booking statuses, and an editable profile.
- Booking and payment with date and quantity availability checks, rental quotes, Stripe Checkout, and webhook-based payment confirmation.
- Owner dashboard with equipment listing management, ImgBB photo uploads, rental records, and monthly earnings charts.
- Admin dashboard with role management, listing approvals, rental monitoring, and platform analytics including monthly bookings.
- Authentication and permissions with Better Auth sessions, JWT verification, and customer, owner, and admin access controls.
- Automated rental completion using a scheduled job, with email notifications to renters and owners through Resend when configured.
- Responsive interface with a light and dark theme preference saved locally, plus loading and error states.
npm packages
Scope	Packages
Client	next, react, react-dom
Client styling and tooling	tailwindcss, @tailwindcss/turbopack, typescript, eslint, eslint-config-next, @types/node, @types/react, @types/react-dom
Server	express, mongodb, better-auth, @better-auth/mongo-adapter, jose, stripe, node-cron, dotenv
Server tooling	typescript, tsx, @types/express, @types/node


MongoDB stores application data. ImgBB and Resend are called over HTTP. The client is hosted on Vercel and the API on Render.
# Smart Workout Frontend

React + Vite frontend for the Smart Workout DSS/BIS prototype.

## Setup

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
cmd /c npm install
```

## Run

Start the backend first:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Then start frontend:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
cmd /c npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Current implemented frontend views:

- `Overview`
- `Gym Membership`
- `Lifestyle Profiles`
- `Profile`
- `Plan`
- `RAG Chat`
- floating bottom-right assistant

## shadcn/ui

The current implementation uses Tailwind-ready local components. To add official shadcn/ui components later:

```powershell
npx shadcn@latest init
npx shadcn@latest add button card input label select slider tabs badge table textarea alert
```


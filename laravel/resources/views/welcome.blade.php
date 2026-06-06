<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexkey - Retro Arcade Cabinets</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0d0e15;
            color: #eceff4;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            overflow: hidden;
            position: relative;
        }

        /* Ambient Cyber Grid Background */
        body::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                linear-gradient(rgba(18, 113, 255, 0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(18, 113, 255, 0.07) 1px, transparent 1px);
            background-size: 40px 40px;
            background-position: center;
            z-index: 1;
            pointer-events: none;
        }

        .container {
            position: relative;
            z-index: 2;
            padding: 2rem;
            max-width: 600px;
            background: rgba(17, 19, 31, 0.9);
            border: 2px solid #00f0ff;
            box-shadow: 0 0 20px rgba(0, 240, 255, 0.25), inset 0 0 15px rgba(0, 240, 255, 0.1);
            border-radius: 8px;
        }

        h1 {
            font-size: 3rem;
            margin: 0 0 1rem 0;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: #00f0ff;
            text-shadow: 0 0 10px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3);
        }

        p {
            font-size: 1rem;
            line-height: 1.6;
            color: #8fbcbb;
            margin-bottom: 2rem;
        }

        .badge {
            display: inline-block;
            background-color: #ff007f;
            color: #ffffff;
            padding: 0.3rem 0.8rem;
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: bold;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(255, 0, 127, 0.5);
            margin-bottom: 1.5rem;
        }

        .status-box {
            border-top: 1px dashed rgba(0, 240, 255, 0.3);
            padding-top: 1.5rem;
            margin-top: 1.5rem;
            font-size: 0.9rem;
        }

        .status-line {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            color: #d8dee9;
        }

        .status-value {
            color: #a3be8c;
            font-weight: bold;
        }

        .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: #4c566a;
        }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">Cabinet Offline Core Live</span>
        <h1>NEXKEY</h1>
        <p>Nexkey Retro Air Hockey Cabinet server is fully booted and operational. Database connection and seeds are loaded successfully.</p>
        
        <div class="status-box">
            <div class="status-line">
                <span>API STATUS:</span>
                <span class="status-value">ONLINE (READY)</span>
            </div>
            <div class="status-line">
                <span>DATABASE SEED STATE:</span>
                <span class="status-value">SYNCHRONIZED</span>
            </div>
            <div class="status-line">
                <span>ENVIRONMENT:</span>
                <span style="color: #ebcb8b;">LOCAL</span>
            </div>
        </div>
        
        <div class="footer">
            &copy; 2026 Nexkey Cabinet Corp. Mode: Developer Arcade System.
        </div>
    </div>
</body>
</html>

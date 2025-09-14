<?php
// Database credentials
$host = 'localhost';
$db = 'flower_login';
$user = 'root';
$pass = '';

// Create a connection to the database
$conn = new mysqli($host, $user, $pass, $db);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($id, $hashed_password);
            $stmt->fetch();

            // Verify password
            if (password_verify($password, $hashed_password)) {
                // Start session and store user info
                session_start();
                $_SESSION['user_id'] = $id;

                // ✅ Redirect to index.html after successful login
                header("Location: index.html");
                exit();
            } else {
                echo "Incorrect password.";
            }
        } else {
            echo "No account found with that email.";
        }
    } else {
        echo "Invalid email format.";
    }
}


// Handle registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register'])) {
    // Get form data
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm-password'];

    // Check if passwords match
    if ($password === $confirm_password) {
        // Sanitize and validate inputs
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);

        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            // Check if email already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                echo "Email already exists.";
            } else {
                // Hash the password before saving it
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);

                // Insert the user into the database
                $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
                $stmt->bind_param("ss", $email, $hashed_password);
                if ($stmt->execute()) {
                    echo "Registration successful!";
                    // Redirect to login page after successful registration
                    header("Location: index.php?action=login"); 
                    exit();
                } else {
                    echo "Error: " . $stmt->error;
                }
            }
        } else {
            echo "Invalid email format.";
        }
    } else {
        echo "Passwords do not match.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Register</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #8e395b;
            font-family: Arial, sans-serif;
        }

        .container {
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            text-align: center;
            width: 300px;
        }

        .container h2 {
            margin-bottom: 20px;
        }

        .input-group {
            margin-bottom: 15px;
            text-align: left;
        }

        .input-group label {
            display: block;
            margin-bottom: 5px;
        }

        .input-group input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }

        .toggle-btn {
            background: none;
            border: none;
            color:#8e395b;
            cursor: pointer;
            margin-top: 10px;
        }

        .btn {
            width: 100%;
            padding: 10px;
            background: #8e395b;
            color: white;
            border: none;
            cursor: pointer;
            margin-top: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <?php if (!isset($_GET['action']) || $_GET['action'] == 'login'): ?>
            <!-- Login Form -->
            <h2>Login</h2>
            <form method="POST" action="index.php?action=login">
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn" name="login">Login</button>
            </form>
            <button class="toggle-btn" onclick="window.location.href='index.php?action=register'">Don't have an account? Register</button>
        <?php elseif (isset($_GET['action']) && $_GET['action'] == 'register'): ?>
            <!-- Registration Form -->
            <h2>Register</h2>
            <form method="POST" action="index.php?action=register">
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="input-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" name="confirm-password" required>
                </div>
                <button type="submit" class="btn" name="register">Sign Up</button>
            </form>
            <button class="toggle-btn" onclick="window.location.href='index.php?action=login'">Already have an account? Login</button>
        <?php endif; ?>
    </div>
</body>

</html>

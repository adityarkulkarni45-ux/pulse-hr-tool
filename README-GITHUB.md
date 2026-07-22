# 💼 Pulse HR Tool

> A modern, full-stack HR management system with zero dependencies

[![GitHub stars](https://img.shields.io/github/stars/adityarkulkarni45-ux/pulse-hr-tool.svg)](https://github.com/adityarkulkarni45-ux/pulse-hr-tool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/adityarkulkarni45-ux/pulse-hr-tool.svg)](https://github.com/adityarkulkarni45-ux/pulse-hr-tool/network)
[![GitHub issues](https://img.shields.io/github/issues/adityarkulkarni45-ux/pulse-hr-tool.svg)](https://github.com/adityarkulkarni45-ux/pulse-hr-tool/issues)

## 🌟 Live Demo

🔗 **[View Live Demo](#)** _(Add your deployed link here)_

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
_Interactive dashboard with 8 panels, real-time analytics, and smooth animations_

### Employee Management
![Employee Directory](docs/screenshots/employee-directory.png)
_Complete employee management with photo capture and filtering_

### Leave Management
![Leave Management](docs/screenshots/leave-management.png)
_Streamlined leave application and approval workflow_

---

## ✨ Features

### 🎨 Modern Dashboard
- **8 Interactive Panels** - Activity feed, charts, quick actions, and more
- **Animated Stat Cards** - Beautiful gradient cards with hover effects
- **Real-time Updates** - Live activity tracking and status monitoring
- **Custom Charts** - CSS-based visualizations (no external libraries!)

### 👥 Employee Management
- ✅ Complete CRUD operations
- 📸 Photo capture via webcam or file upload
- 🔍 Department-based filtering
- 📊 Employee analytics and reporting
- 👤 Profile management with all details

### 🏖️ Leave Management
- 📝 Easy leave application
- ✅ Admin approval/rejection workflow
- 💬 Rejection reason tracking
- 📊 Leave balance monitoring
- 📈 Visual leave status charts

### 🔒 Security
- 🔐 Password-protected admin access
- 👤 Role-based permissions (Admin/Employee)
- 🛡️ Input validation and sanitization
- 🔒 Secure session management

### 🎯 User Experience
- ✨ Smooth 60fps animations
- 📱 Fully responsive design
- 🎨 Modern gradient aesthetics
- ⚡ Lightning-fast performance
- 🔙 Intuitive back navigation

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/adityarkulkarni45-ux/pulse-hr-tool.git

# Navigate to project directory
cd pulse-hr-tool

# Navigate to backend
cd backend

# Start the server (no npm install needed - zero dependencies!)
node server.js
```

### Access the Application

```
🌐 Open browser: http://localhost:4000

👨‍💼 Admin Login:
   - Click "🔐 Admin Access"
   - Password: admin123

👤 Employee Login:
   - Click "I'm an employee"
   - Select from employee list
```

---

## 📚 Documentation

- 📖 [Quick Start Guide](QUICK-START.md)
- 🎨 [Dashboard Features](DASHBOARD-FEATURES.md)
- 🆕 [What's New](WHATS-NEW.md)
- 🧪 [Testing Guide](CLEAR-CACHE-AND-TEST.md)
- 📋 [Project Summary](PROJECT-SUMMARY.md)

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (built-in HTTP module)
- **Architecture**: RESTful API
- **Database**: JSON file-based storage
- **Dependencies**: **ZERO** 🎉

### Frontend
- **Structure**: HTML5
- **Styling**: CSS3 (custom animations)
- **Scripting**: Vanilla JavaScript (ES6+)
- **Design**: Mobile-first responsive

### Key Highlights
- ✅ No external dependencies
- ✅ Pure vanilla JavaScript
- ✅ Custom CSS animations
- ✅ Hardware-accelerated effects
- ✅ RESTful API design
- ✅ Modular code structure

---

## 📁 Project Structure

```
pulse-hr-tool/
├── backend/
│   ├── server.js           # HTTP server & API routes
│   ├── db.js               # Database operations
│   ├── data/               # JSON data storage
│   │   ├── employees.json
│   │   ├── leaves.json
│   │   └── ...
│   └── uploads/            # Employee photos
│
├── frontend/
│   ├── index.html          # Main UI
│   ├── app.js              # Client logic
│   └── styles.css          # Styles & animations
│
├── docs/                   # Documentation
│   ├── QUICK-START.md
│   ├── DASHBOARD-FEATURES.md
│   └── screenshots/
│
└── README.md
```

---

## 🎯 API Endpoints

### Employees
```http
GET    /api/employees        # List all employees
GET    /api/employees/:id    # Get employee by ID
POST   /api/employees        # Create employee
PUT    /api/employees/:id    # Update employee
DELETE /api/employees/:id    # Delete employee
```

### Leaves
```http
GET    /api/leaves           # List leaves (filterable by employeeId)
POST   /api/leaves           # Create leave request
PUT    /api/leaves/:id       # Update leave status
```

### Dashboard
```http
GET    /api/dashboard        # Get dashboard statistics
```

### Onboarding
```http
GET    /api/onboarding/:employeeId    # Get checklist
PUT    /api/onboarding/:employeeId    # Update item
```

---

## 🎨 Features Showcase

### Interactive Dashboard
- 📊 4 gradient stat cards with animations
- 📋 Real-time activity feed (last 10 actions)
- 🏖️ Leave overview with color coding
- ⚡ Quick action buttons (role-based)
- ⭐ Recent employee additions
- 📊 Department distribution chart
- 📈 Leave status visualization
- 💻 Live system status monitoring

### Advanced Animations
- ✨ Fade-in effects on page load
- 🎪 Hover lift and shadow effects
- 📈 Growing chart bar animations
- 💫 Pulsing gradient backgrounds
- 🌊 Ripple effects on buttons
- ⚡ Smooth view transitions

### Photo Management
- 📷 Webcam capture integration
- 📁 File upload support
- 🖼️ Automatic file storage
- 👤 Circular profile photos
- 🎨 Gradient placeholder initials

---

## 🔧 Configuration

### Admin Password
Edit in `frontend/app.js`:
```javascript
const ADMIN_PASSWORD = "admin123"; // Change this
```

### Server Port
Edit in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 4000; // Change default port
```

### Data Storage
All data is stored in `backend/data/` as JSON files:
- `employees.json` - Employee records
- `leaves.json` - Leave requests
- `onboarding.json` - Onboarding checklists
- `salaries.json` - Salary information
- `attendance.json` - Attendance records

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
node db.test.js

# Run server tests
node server.test.js

# Run property-based tests
node id-immutability.pbt.js
node record-retention.pbt.js
```

For detailed testing instructions, see [CLEAR-CACHE-AND-TEST.md](CLEAR-CACHE-AND-TEST.md)

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack web development
- RESTful API design
- CSS animations and transitions
- JavaScript ES6+ features
- Responsive web design
- File system operations
- Role-based access control
- Modern UI/UX patterns

Perfect for:
- 📚 Learning full-stack development
- 💼 Portfolio projects
- 🏢 Small business HR needs
- 🎓 Educational purposes

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 Roadmap

### Planned Features
- [ ] Attendance tracking system
- [ ] Payroll calculations
- [ ] Performance review module
- [ ] Document management
- [ ] Email notifications
- [ ] Report export (PDF/Excel)
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Database migration (MongoDB/PostgreSQL)
- [ ] JWT authentication
- [ ] Docker support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya Kulkarni**
- GitHub: [@adityarkulkarni45-ux](https://github.com/adityarkulkarni45-ux)
- Email: adityarkulkarni45@gmail.com

---

## 🙏 Acknowledgments

- Built with ❤️ using vanilla JavaScript
- Zero external dependencies
- Inspired by modern HR management needs
- Designed for simplicity and efficiency

---

## 📊 Project Stats

- **Lines of Code**: 2,500+
- **Files**: 15+ source files
- **Features**: 25+ implemented
- **Animations**: 10+ custom effects
- **API Endpoints**: 12 RESTful routes
- **Documentation**: 8 comprehensive guides

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

## 📞 Support

For support, email adityarkulkarni45@gmail.com or open an issue in the repository.

---

## 🎉 Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**[⬆ back to top](#-pulse-hr-tool)**

Made with ❤️ and ☕

</div>

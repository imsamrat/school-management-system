# School Management System

A comprehensive, full-stack School Management System built with modern web technologies. Features role-based access control, student/teacher management, attendance tracking, grade management, and an advanced ID card generation system.

## 🚀 Features

### Core System Features ✅

- **Authentication System**: NextAuth.js with role-based access control
- **Role-Based Dashboards**: Separate interfaces for Admin, Staff, Teacher, and Student
- **Student Management**: Complete CRUD operations with profile management and image uploads
- **Teacher Management**: Faculty profiles with department assignments and image uploads
- **Attendance System**:
  - Teachers can mark daily attendance for their classes
  - Students can view their attendance records and statistics
  - Real-time attendance analytics and performance tracking
  - Bulk attendance operations
  - Monthly attendance reports
- **Grade Management**:
  - Complete grading system with publish/draft functionality
  - Bulk grade operations for teachers
  - Student grade viewing with published status control
- **Class & Subject Management**: Organize students into classes with subjects
- **Fee Management**: Student fee tracking and payment records
- **Messaging System**: Internal communication and announcements
- **School Settings**: Configurable school information and branding

### 🆔 ID Card System (Advanced Feature)

- **Professional Design**: 3D flip animation with modern card layouts
- **Student ID Cards**:
  - Blue-themed professional design
  - Student photo, name, and ID integration
  - Academic information and class details
  - Emergency contact information
  - School branding and logo
- **Teacher ID Cards**:
  - Green-themed faculty design
  - Teacher photo and credentials
  - Department and specialization display
  - Professional qualifications
  - Faculty contact information
- **Dynamic Content**: School information fetched from settings API
- **Export Features**: Print and download functionality for individual cards
- **Bulk Operations**: Mass generation by class or department
- **Admin Interface**: Complete ID card management dashboard with:
  - Individual student/teacher card previews
  - Bulk generation tools
  - Print/download controls
  - Card statistics and management

### Technical Excellence

- **Image Upload System**: Professional image handling with UUID naming and validation
- **Responsive Design**: Mobile-first approach with TailwindCSS and shadcn/ui
- **Type Safety**: Full TypeScript implementation with strict typing
- **Modern Architecture**: Next.js 15.5.4 with Turbopack for optimal performance

## 🛠 Technology Stack

- **Frontend**: Next.js 15.5.4 with App Router and Turbopack
- **Backend**: Next.js API Routes with comprehensive REST endpoints
- **Database**: SQLite with Prisma ORM (production-ready, easily switchable to PostgreSQL)
- **Authentication**: NextAuth.js with role-based access control and bcryptjs
- **UI Framework**: TailwindCSS + shadcn/ui components with Radix UI primitives
- **Language**: TypeScript with strict type checking
- **File Handling**: Image upload system with validation and UUID naming
- **Icons**: Lucide React for modern iconography
- **Development**: Fast refresh with Turbopack for optimal developer experience

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd school-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create and seed database
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## 👥 Demo Accounts

Use these credentials to test different user roles:

| Role        | Email              | Password   |
| ----------- | ------------------ | ---------- |
| **Admin**   | admin@school.com   | admin123   |
| **Staff**   | staff@school.com   | staff123   |
| **Teacher** | teacher@school.com | teacher123 |
| **Student** | alice@student.com  | student123 |

## 📋 Testing Guide

### 1. Authentication Testing

- Visit the login page and test each demo account
- Verify role-based redirects to appropriate dashboards
- Test logout functionality

### 2. Admin Dashboard Testing

- **Student Management**: Create, edit, view, and delete student profiles with image uploads
- **Teacher Management**: Faculty profiles with department assignments and image uploads
- **Grade Management**: Publish/unpublish grades to control student visibility
- **ID Card System**:
  - Navigate to Admin > ID Cards
  - Test student ID card generation with previews
  - Test teacher ID card generation with professional themes
  - Try bulk generation for classes/departments
  - Test print and download functionality
- **Dashboard Overview**: View system statistics and recent activities
- **School Settings**: Configure school information for ID cards

### 3. Teacher Dashboard Testing

- **Attendance Marking**:
  - Navigate to Teacher > Attendance
  - Select a class and date
  - Mark attendance for students (Present, Absent, Late, Excused)
  - Add remarks for specific attendance records
  - Use bulk operations (Mark All Present)
- **Class Management**: View assigned classes and student lists

### 4. Student Dashboard Testing

- **Attendance Viewing**:
  - Navigate to Student > Attendance
  - View monthly attendance statistics
  - Check attendance performance indicators
  - Filter records by different months
  - Review detailed attendance history
- **Grade Reports**: View published grades and academic performance
- **Profile Management**: Update personal information and profile image

### 5. Staff Dashboard Testing

- Test staff-specific functionality and access controls
- Verify limited access compared to admin privileges

## 🗃 Database Schema

### Key Models

- **User**: Base user model with authentication data and role-based access
- **StudentProfile/TeacherProfile**: Extended profile information with image support
- **Class**: Class organization with name and section
- **Subject**: Subjects taught in classes
- **Attendance**: Daily attendance records with status and remarks
- **Grade**: Academic grades with publish/draft status control
- **SchoolSettings**: Configurable school information for branding and ID cards

### Relationships

- Users have role-specific profiles (Student/Teacher)
- Students belong to classes
- Classes have multiple subjects
- Teachers can teach multiple classes
- Attendance records link students, teachers, classes, and subjects

## 🔐 Security Features

- **Authentication**: Secure password hashing with bcryptjs
- **Authorization**: Role-based access control middleware
- **Route Protection**: Server-side and client-side route guards
- **API Security**: Protected API endpoints with session validation
- **Type Safety**: Full TypeScript implementation with strict typing

## 📱 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Students

- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance record
- `GET /api/classes/[classId]/students` - Get students in class
- `GET /api/classes/[classId]/subjects` - Get subjects for class

### Grades

- `GET /api/grades` - List grades with filtering
- `POST /api/grades` - Create new grade entry
- `PUT /api/grades/[id]` - Update grade
- `POST /api/grades/[id]/publish` - Publish/unpublish grade

### File Upload

- `POST /api/upload/image` - Upload profile images with validation

### School Settings

- `GET /api/settings/school` - Get school information for ID cards
- `PUT /api/settings/school` - Update school settings

## 🎨 UI Components

The system uses shadcn/ui components for a consistent, modern interface:

- **Forms**: Input, Select, Textarea with validation
- **Data Display**: Tables, Cards, Badges, Statistics
- **Navigation**: Sidebar, Dropdowns, Breadcrumbs
- **Feedback**: Toasts, Loading states, Error messages
- **Interactive**: Buttons, Modals, Calendars

## 🚀 Production Deployment

### Database Migration (SQLite → PostgreSQL)

1. **Update environment variables**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/school_db"
   ```

2. **Update Prisma schema**

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Deploy and migrate**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### Deployment Platforms

- **Vercel** (Recommended): Zero-config Next.js deployment
- **Railway**: Full-stack with PostgreSQL database
- **Render**: Web service with database
- **DigitalOcean**: App Platform deployment

## 🔄 Future Enhancements (Full Version)

### Phase 2 Features

- **Assignment Management**: Create, submit, and grade assignments
- **Grading System**: Comprehensive grade tracking and report cards
- **Communication**: Messaging system between users
- **Fee Management**: Fee collection and payment tracking
- **Scheduling**: Timetable and calendar management
- **Reports**: Advanced analytics and PDF reports
- **Notifications**: Real-time updates and alerts
- **Parent Portal**: Parent access to student information

### Technical Improvements

- **Real-time Updates**: WebSocket integration
- **File Upload**: Document and image management
- **Email Integration**: Automated notifications
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Charts and dashboard widgets
- **Backup System**: Automated data backup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Reset database
   rm prisma/dev.db
   npx prisma db push
   npx prisma db seed
   ```

2. **Authentication Problems**

   - Ensure `NEXTAUTH_SECRET` is set in environment variables
   - Check `NEXTAUTH_URL` matches your domain

3. **Build Errors**

   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **TypeScript Errors**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   ```

## 📞 Support

For questions and support:

- Create an issue in the repository
- Review the documentation
- Check the troubleshooting guide

---

**Status**: MVP Complete ✅ | **Version**: 1.0.0 | **Last Updated**: January 2025

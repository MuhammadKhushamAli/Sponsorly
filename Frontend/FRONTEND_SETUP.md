# Frontend Architecture & Setup Guide

## 🎨 Design System

### Color Palette (Modular)
The theme system is completely modular and located in `src/theme/colors.js`:

- **Primary Gradient**: Purple to Blue (#9d4edd to #5a189a)
- **Secondary Gradient**: Orange to Pink (#ff6b35 to #ff9a56)  
- **Accent**: Teal (#14b8a6)
- **Neutral**: Gray scale for typography and backgrounds
- **Status**: Success, Warning, Error, Info colors

All colors are pre-configured in Tailwind and can be easily modified in one place.

### Gradients
Creative gradients are available as utility classes:
- `bg-gradient-brand` - Main purple-blue gradient
- `bg-gradient-vibrant` - Orange-pink energy gradient
- `bg-gradient-cool` - Teal cooling gradient
- `bg-gradient-warm` - Warm accent gradient
- `bg-gradient-dark` - Dark theme gradient

## 🏗️ Folder Structure

```
src/
├── assets/              # Images, icons, static files
├── components/
│   ├── Layout/         # Main layout components (Navbar, Sidebar)
│   ├── common/         # Reusable UI components (Button, Card, Input, etc.)
│   └── features/       # Feature-specific components
├── pages/              # Page components (Dashboard, Campaigns, Chat, etc.)
├── redux/
│   ├── slices/        # Redux slices for state (auth, campaigns, chats, etc.)
│   └── store.js       # Redux store configuration
├── services/
│   └── api.js         # Axios API client with endpoints
├── theme/
│   └── colors.js      # Modular color system
├── App.jsx            # Main app with routing
├── index.css          # Global Tailwind styles
└── main.jsx           # Entry point
```

## 📦 Tech Stack

- **React 19** - UI framework
- **React Router v6** - Routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🚀 Getting Started

### Installation

```bash
cd Frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

## 🔐 Authentication Flow

1. User signs up/logs in
2. Tokens are stored in localStorage
3. Redux auth slice manages user state
4. Protected routes check for valid token
5. Axios interceptor adds token to all requests

## 🎯 Redux Store Structure

### Auth Slice
- `user` - Current user data
- `token` - Access token
- `refreshToken` - Refresh token
- `isAuthenticated` - Auth status
- `isLoading` - Loading state
- `error` - Error messages

### Campaign Slice
- `campaigns` - List of campaigns
- `currentCampaign` - Selected campaign
- `filter` - Active filters
- `isLoading` - Loading state
- `error` - Error messages

### Chat Slice
- `chats` - List of chats
- `currentChat` - Active chat
- `messages` - Current chat messages
- `isLoading` - Loading state

### Collab Slice
- `requests` - Collab requests
- `filter` - Active filters
- `isLoading` - Loading state

### Review Slice
- `reviews` - List of reviews
- `currentReview` - Selected review
- `isLoading` - Loading state

## 🎨 Theming

To customize the theme:

1. Edit `src/theme/colors.js` to modify colors
2. Update Tailwind config if adding new utilities
3. All components automatically use the new colors

## 📱 Responsive Design

All components are fully responsive using Tailwind breakpoints:
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px

## 🔗 API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
// Example usage
import { campaignAPI } from './services/api';

const campaigns = await campaignAPI.find({ tags: ['tech'] });
```

## 📝 Component Examples

### Button
```jsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click me
</Button>
```

### Card
```jsx
<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Input
```jsx
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  error={emailError}
/>
```

## 🚧 Future Enhancements

- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Advanced filtering UI
- [ ] Real-time notifications
- [ ] Image upload optimization
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Performance optimization
- [ ] Service worker for offline support

## 📞 Support

For issues or questions, check the backend API documentation in the main project README.

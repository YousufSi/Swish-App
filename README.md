Swish - Basketball App

Demo Link: https://swish-app-demo.bolt.host

A modern web application for finding and organizing basketball games near you. Built with React, TypeScript, Tailwind CSS, and Supabase.

Features:

-Find Games: Discover basketball games in your area
-Create Games: Organize your own basketball sessions
-Court Discovery: Find nearby basketball courts with detailed information
-Player Management: Join games and manage participants
-Game Chat: Communicate with other players
-Dark Mode: Beautiful dark/light theme support
-Responsive: Works perfectly on all devices

Tech Stack:

-Frontend: React 18, TypeScript, Vite
-Styling: Tailwind CSS with custom Nike-inspired design system
-Backend: Supabase (PostgreSQL, Auth, Real-time)
-Icons: Lucide React
-Deployment: Netlify

Getting Started:

Prerequisites:

- Node.js 18+ 
- npm or yarn
- Supabase account

Installation:

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/swish-basketball-app.git
   cd swish-basketball-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Configure authentication providers if needed

5. Start the development server
   ```bash
   npm run dev
   ```

Project Structure:

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Theme, etc.)
├── lib/               # Utilities and Supabase client
├── pages/             # Main application pages
├── services/          # External service integrations
└── styles/            # Global styles and Tailwind config
```

Design System:

The app uses a custom Nike-inspired design system with:
-Colors: Nike Red (#FA5400), Nike Black, and grayscale palette
-Typography: Bold, uppercase headings with proper hierarchy
-Components: Consistent button styles, cards, and form elements
-Dark Mode: Full dark theme support

Key Features:

Game Management
- Create and organize basketball games
- Real-time participant updates
- Equipment planning and coordination
- Game chat functionality

Court Discovery
- Find nearby basketball courts using location services
- Detailed court information (surface, lighting, amenities)
- Integration with OpenStreetMap and location APIs

User Profiles
- Skill level and game preferences
- Game statistics and achievements
- Friend system and social features

Deployment:

The app is configured for easy deployment on Netlify:

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy to Netlify
   - Connect your GitHub repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy automatically on push to main branch

Contributing:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

License:

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Acknowledgments:

- Nike design inspiration
- Supabase for the amazing backend platform
- OpenStreetMap for court location data
- The basketball community for inspiration

---

(Built with love for the basketball community)

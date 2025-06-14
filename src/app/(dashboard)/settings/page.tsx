// app/(dashboard)/settings/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Database,
  Users,
  Save,
  CheckCircle,
  X,
  AlertCircle,
  ChevronRight,
  Camera,
  Link as LinkIcon,
  LogOut,
  AtSign,
  Moon,
  Sun,
  Lock,
  RefreshCw,
  Smartphone,
  Github,
  Chrome,
  UserPlus,
  ChevronLeft,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    mentionNotifications: true,
    assigneeNotifications: true
  });
  
  const [themeSettings, setThemeSettings] = useState({
    theme: "system",
    sidebarCollapsed: false,
    denseMode: false,
    animationsEnabled: true
  });
  
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Senior Software Engineer with focus on full-stack development",
    avatar: "", // URL would go here
    phoneNumber: "+1 (555) 123-4567",
    jobTitle: "Senior Software Engineer",
    department: "Engineering",
    location: "New York, USA",
    timeZone: "America/New_York"
  });
  
  // Toggle notifications setting
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };
  
  // Change theme setting
  const changeThemeSetting = (setting: keyof typeof themeSettings, value: boolean | 'light' | 'dark' | 'system') => {
    setThemeSettings({
      ...themeSettings,
      [setting]: value
    });
  };
  
  // Update profile field
  const updateProfile = (field: keyof typeof profileData, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Mock save function
  const saveSettings = () => {
    console.log('Saving settings...');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
        
        <button 
          onClick={saveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle size={18} className="mr-2" />
            <span>Settings saved successfully!</span>
          </div>
          <button 
            onClick={() => setShowSuccess(false)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <nav>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "profile"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <User size={18} className={`mr-3 ${activeTab === "profile" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "profile" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Profile</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "notifications"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Bell size={18} className={`mr-3 ${activeTab === "notifications" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "notifications" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Notifications</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              
              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "appearance"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Palette size={18} className={`mr-3 ${activeTab === "appearance" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "appearance" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Appearance</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "security"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Shield size={18} className={`mr-3 ${activeTab === "security" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "security" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Security</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              
              <button
                onClick={() => setActiveTab("integrations")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "integrations"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Database size={18} className={`mr-3 ${activeTab === "integrations" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "integrations" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Integrations</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              
              <button
                onClick={() => setActiveTab("team")}
                className={`flex items-center w-full px-4 py-3 text-left ${
                  activeTab === "team"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users size={18} className={`mr-3 ${activeTab === "team" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`${activeTab === "team" ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>Team</span>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleLogout} className="flex items-center w-full p-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <LogOut size={18} className="mr-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Settings</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal information and profile settings</p>
                </div>
                
                {/* Profile Photo */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                      {profileData.avatar ? (
                        // <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        <Image src={profileData.avatar} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white dark:border-gray-800 hover:bg-blue-700 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                  
                  <div className="sm:flex-1">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">{profileData.fullName}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{profileData.email}</p>
                    <div className="mt-3 space-x-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Upload new photo
                      </button>
                      <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => updateProfile('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={profileData.username}
                      onChange={(e) => updateProfile('username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Professional Information */}
                <div className="pb-1 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Professional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) => updateProfile('jobTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <input
                      id="department"
                      type="text"
                      value={profileData.department}
                      onChange={(e) => updateProfile('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={profileData.location}
                      onChange={(e) => updateProfile('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Zone
                    </label>
                    <select
                      id="timeZone"
                      value={profileData.timeZone}
                      onChange={(e) => updateProfile('timeZone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notification Settings</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage how you receive notifications</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Email Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.emailNotifications}
                        onChange={() => toggleNotification('emailNotifications')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Bell size={20} className="text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Push Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive push notifications in your browser</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.pushNotifications}
                        onChange={() => toggleNotification('pushNotifications')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Weekly Digest</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive a weekly summary of activities</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.weeklyDigest}
                        onChange={() => toggleNotification('weeklyDigest')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <AtSign size={20} className="text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Mentions</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Notify when someone mentions you</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.mentionNotifications}
                        onChange={() => toggleNotification('mentionNotifications')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Assignee Updates</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Notify when you are assigned to a ticket</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.assigneeNotifications}
                        onChange={() => toggleNotification('assigneeNotifications')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            Heres the remaining code for the Appearance Settings and the rest of the Settings page:
{/* Appearance Settings */}
{activeTab === "appearance" && (
  <div className="space-y-8">
    <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Appearance Settings</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Customize the look and feel of the application</p>
    </div>
    
    <div className="space-y-6">
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Palette size={20} className="text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Theme</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred color theme</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => changeThemeSetting('theme', 'light')}
            className={`p-2 rounded-md ${themeSettings.theme === 'light' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Sun size={20} />
          </button>
          <button 
            onClick={() => changeThemeSetting('theme', 'dark')}
            className={`p-2 rounded-md ${themeSettings.theme === 'dark' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Moon size={20} />
          </button>
          <button 
            onClick={() => changeThemeSetting('theme', 'system')}
            className={`p-2 rounded-md ${themeSettings.theme === 'system' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
          >
            <Smartphone size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <ChevronLeft size={20} className="text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Sidebar Collapsed</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Start with collapsed sidebar</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={themeSettings.sidebarCollapsed}
            onChange={() => changeThemeSetting('sidebarCollapsed', !themeSettings.sidebarCollapsed)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Palette size={20} className="text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Dense Mode</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Use compact UI elements</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={themeSettings.denseMode}
            onChange={() => changeThemeSetting('denseMode', !themeSettings.denseMode)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center space-x-3">
          <RefreshCw size={20} className="text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Animations</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enable UI animations</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={themeSettings.animationsEnabled}
            onChange={() => changeThemeSetting('animationsEnabled', !themeSettings.animationsEnabled)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  </div>
)}

{/* Security Settings */}
{activeTab === "security" && (
  <div className="space-y-8">
    <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security Settings</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account security and authentication</p>
    </div>
    
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Change Password</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button className="px-4 py-2 mt-2 w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Two-Factor Authentication</h3>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertCircle className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 h-5 w-5 mr-2" />
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              Two-factor authentication is not enabled yet. We strongly recommend enabling 2FA for enhanced security.
            </div>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Set up Two-Factor Authentication
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Connected Devices</h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <Chrome size={20} className="text-gray-600 dark:text-gray-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">Chrome on Windows</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">New York, USA • Last active 2 minutes ago</p>
              </div>
            </div>
            <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
              Logout
            </button>
          </div>
          
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone size={20} className="text-gray-600 dark:text-gray-400 mr-3" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">iPhone App</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">New York, USA • Last active 4 days ago</p>
              </div>
            </div>
            <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Integrations Settings */}
{activeTab === "integrations" && (
  <div className="space-y-8">
    <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Integrations</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connect with third-party services and tools</p>
    </div>
    
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Github size={24} className="text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white">GitHub</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect to your GitHub account to import repositories</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Connect
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="currentColor" className="text-gray-800 dark:text-gray-200" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white">Slack</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in your Slack channels</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Connect
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.3 8.925L15.05 4.675C14.76 4.385 14.38 4.199 14 4.125C13.62 4.051 13.21 4.08 12.875 4.3L4.275 8.925C3.98 9.075 3.735 9.305 3.565 9.59C3.395 9.875 3.3 10.205 3.3 10.55V19C3.3 19.53 3.51 20.039 3.885 20.414C4.26 20.789 4.769 21 5.3 21H18.7C19.231 21 19.74 20.789 20.115 20.414C20.49 20.039 20.7 19.53 20.7 19V10.55C20.7 10.205 20.605 9.875 20.435 9.59C20.265 9.305 20.02 9.075 19.725 8.925H19.3ZM12 15C11.405 15 10.825 14.824 10.33 14.492C9.835 14.16 9.446 13.686 9.21 13.129C8.973 12.571 8.9 11.951 8.998 11.351C9.096 10.752 9.361 10.2 9.76 9.765C10.16 9.33 10.675 9.016 11.24 8.868C11.805 8.72 12.4 8.744 12.949 8.936C13.5 9.129 13.983 9.482 14.345 9.95C14.706 10.419 14.929 10.984 14.975 11.575C14.99 11.883 14.94 12.192 14.83 12.482C14.719 12.772 14.55 13.037 14.331 13.259C14.112 13.482 13.849 13.658 13.559 13.775C13.27 13.893 12.961 13.95 12.65 13.943C12.435 13.943 12.218 13.921 12 13.871" fill="currentColor" className="text-gray-800 dark:text-gray-200" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white">Google Drive</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Attach files from Google Drive</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
            Connected
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">API Access</h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white text-sm">Personal API Key</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Use this key to access the API</p>
            </div>
            <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Generate Key
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value="••••••••••••••••••••••••••••"
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <LinkIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Team Settings */}
{activeTab === "team" && (
  <div className="space-y-8">
    <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Team Settings</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage team members and their permissions</p>
    </div>
    
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Team Members</h3>
      <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
        <UserPlus size={16} />
        <span>Add Member</span>
      </button>
    </div>
    
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  JD
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    john.doe@example.com
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Admin
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Edit</a>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-pink-600 text-white flex items-center justify-center">
                  SS
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Sarah Smith
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    sarah.smith@example.com
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Member
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Edit</a>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  MJ
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Mike Johnson
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    mike.johnson@example.com
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Member
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Inactive
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Edit</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
}
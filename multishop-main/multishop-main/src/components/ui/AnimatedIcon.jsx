/**
 * AnimatedIcon - Thư viện icon chuẩn với animation
 * UI Layer - Presentation only
 * 
 * Version: 2.0.0
 * Last Updated: 2025-01-08
 * 
 * USAGE:
 * import { Icon } from '@/components/ui/AnimatedIcon.jsx';
 * <Icon.CheckCircle /> // Icon với animation mặc định
 * <Icon.Spinner /> // Loading spinner
 * <AnimatedIcon name="Heart" animation="heartbeat" size={32} /> // Custom
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  // Loading & Status
  Loader2, RefreshCw, CheckCircle2, Check, CircleX, X as XIcon, AlertCircle, AlertTriangle,
  Info, HelpCircle, Shield, ShieldAlert, ShieldCheck, Briefcase,
  
  // Actions
  Bell, Send, Plus, Minus, Trash2, Trash, Pencil, Edit, Edit2, Edit3,
  Save, Copy, Download, Upload, Share, Share2, ExternalLink,
  Maximize, Maximize2, Minimize, Minimize2, ZoomIn, ZoomOut,
  
  // Navigation
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ChevronsRight, ChevronsLeft,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight,
  CornerDownLeft, CornerUpRight, MoveRight, MoveLeft,
  
  // Business & Finance
  DollarSign, Wallet, CreditCard, Banknote, Coins, TrendingUp, TrendingDown,
  PieChart, BarChart, BarChart2, BarChart3, LineChart, Activity,
  Target, Award, Trophy, Medal, Star, Sparkles, Zap, Crown,
  
  // User & Social
  User, Users, UserPlus, UserMinus, UserCheck, UserX,
  Heart, ThumbsUp, ThumbsDown, MessageCircle, MessageSquare, Mail,
  AtSign, Phone, Video, Mic, MicOff, Eye, EyeOff,
  
  // Time & Calendar
  Clock, Calendar, CalendarDays, Timer, Hourglass, Watch,
  
  // Files & Documents
  FileText, File, Files, Folder, FolderOpen, Archive,
  Paperclip, Link, Link2, Image, FileImage, FileVideo,
  
  // Commerce & Shopping
  ShoppingCart, ShoppingBag, Package, PackageCheck, PackageX,
  Tag, Tags, Gift, Percent, Receipt,
  
  // Development & System
  Bug, TestTube, Code, Code2, Terminal, Cpu, Database,
  Settings, Sliders, Wrench, Puzzle, Box,
  
  // UI Elements
  Search, Filter, SlidersHorizontal, MoreVertical, MoreHorizontal,
  Menu, Grid, List, Columns, Layout, LayoutGrid, LayoutList,
  Bookmark, Pin, Flag, MapPin, Map, Navigation,
  
  // Media & Content
  Camera, Film, Music, Headphones, Volume2, VolumeX,
  Play, Pause, SkipForward, SkipBack, FastForward, Rewind,
  
  // Nature & Objects
  Sun, Moon, Cloud, CloudRain, Droplets, Flame, Leaf,
  Home, Building, Building2, Store, Factory, Warehouse,
  Car, Truck, Plane, Ship, Bike,
  
  // Communication
  Wifi, WifiOff, Signal, Bluetooth, Radio, Rss,
  
  // Misc
  Lightbulb, Rocket, Fingerprint, Key, Lock, Unlock,
  Globe, Compass, Anchor, Layers, LifeBuoy, Ban, Inbox,
  QrCode, MonitorPlay, Presentation
} from 'lucide-react';

// ========== ICON MAP ==========

const iconMap = {
  // Loading & Status
  Loader2, RefreshCw, CheckCircle2, Check, CircleX, XIcon, AlertCircle, AlertTriangle,
  Info, HelpCircle, Shield, ShieldAlert, ShieldCheck, Briefcase,
  
  // Actions
  Bell, Send, Plus, Minus, Trash2, Trash, Pencil, Edit, Edit2, Edit3,
  Save, Copy, Download, Upload, Share, Share2, ExternalLink,
  Maximize, Maximize2, Minimize, Minimize2, ZoomIn, ZoomOut,
  
  // Navigation
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ChevronsRight, ChevronsLeft,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight,
  CornerDownLeft, CornerUpRight, MoveRight, MoveLeft,
  
  // Business & Finance
  DollarSign, Wallet, CreditCard, Banknote, Coins, TrendingUp, TrendingDown,
  PieChart, BarChart, BarChart2, BarChart3, LineChart, Activity,
  Target, Award, Trophy, Medal, Star, Sparkles, Zap, Crown,
  
  // User & Social
  User, Users, UserPlus, UserMinus, UserCheck, UserX,
  Heart, ThumbsUp, ThumbsDown, MessageCircle, MessageSquare, Mail,
  AtSign, Phone, Video, Mic, MicOff, Eye, EyeOff,
  
  // Time & Calendar
  Clock, Calendar, CalendarDays, Timer, Hourglass, Watch,
  
  // Files & Documents
  FileText, File, Files, Folder, FolderOpen, Archive,
  Paperclip, Link, Link2, Image, FileImage, FileVideo,
  
  // Commerce & Shopping
  ShoppingCart, ShoppingBag, Package, PackageCheck, PackageX,
  Tag, Tags, Gift, Percent, Receipt,
  
  // Development & System
  Bug, TestTube, Code, Code2, Terminal, Cpu, Database,
  Settings, Sliders, Wrench, Puzzle, Box,
  
  // UI Elements
  Search, Filter, SlidersHorizontal, MoreVertical, MoreHorizontal,
  Menu, Grid, List, Columns, Layout, LayoutGrid, LayoutList,
  Bookmark, Pin, Flag, MapPin, Map, Navigation,
  
  // Media & Content
  Camera, Film, Music, Headphones, Volume2, VolumeX,
  Play, Pause, SkipForward, SkipBack, FastForward, Rewind,
  
  // Nature & Objects
  Sun, Moon, Cloud, CloudRain, Droplets, Flame, Leaf,
  Home, Building, Building2, Store, Factory, Warehouse,
  Car, Truck, Plane, Ship, Bike,
  
  // Communication
  Wifi, WifiOff, Signal, Bluetooth, Radio, Rss,
  
  // Misc
  Lightbulb, Rocket, Fingerprint, Key, Lock, Unlock,
  Globe, Compass, Anchor, Layers, LifeBuoy, Ban, Inbox,
  QrCode, MonitorPlay, Presentation
};

// ========== ANIMATION PRESETS ==========

const animations = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },
  
  pulse: {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 1.5, repeat: Infinity }
  },
  
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.6, repeat: Infinity }
  },
  
  shake: {
    animate: { x: [0, -5, 5, -5, 5, 0] },
    transition: { duration: 0.5 }
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  scaleIn: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
  
  slideInLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  slideInRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  pop: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 400, damping: 15 }
  },
  
  wiggle: {
    animate: { rotate: [-5, 5, -5, 5, 0] },
    transition: { duration: 0.5 }
  },
  
  float: {
    animate: { y: [0, -8, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  
  glowPulse: {
    animate: { 
      filter: ["drop-shadow(0 0 2px currentColor)", "drop-shadow(0 0 8px currentColor)", "drop-shadow(0 0 2px currentColor)"]
    },
    transition: { duration: 2, repeat: Infinity }
  },
  
  rotateOnce: {
    animate: { rotate: 360 },
    transition: { duration: 0.5 }
  },
  
  heartbeat: {
    animate: { scale: [1, 1.3, 1, 1.3, 1] },
    transition: { duration: 1, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 1] }
  }
};

// ========== MAIN COMPONENT ==========

export function AnimatedIcon({ 
  name, 
  animation = 'fadeIn',
  className = '',
  size = 24,
  color,
  hover = false,
  customAnimation,
  ...props 
}) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AnimatedIcon library`);
    return null;
  }

  const animationProps = customAnimation || animations[animation] || animations.fadeIn;
  
  const iconElement = (
    <IconComponent 
      size={size} 
      className={className}
      color={color}
      {...props}
    />
  );

  if (hover) {
    return (
      <motion.div
        className="inline-block"
        whileHover={animationProps.animate}
        transition={animationProps.transition}
      >
        {iconElement}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="inline-block"
      {...animationProps}
    >
      {iconElement}
    </motion.div>
  );
}

// ========== PRESET ICONS (Commonly Used) ==========

export const Icon = {
  // Loading
  Spinner: (props) => <AnimatedIcon name="Loader2" animation="spin" {...props} />,
  Loading: (props) => <AnimatedIcon name="RefreshCw" animation="spin" {...props} />,
  RefreshCw: (props) => <AnimatedIcon name="RefreshCw" animation="rotateOnce" {...props} />,
  
  // Status
  CheckCircle: (props) => <AnimatedIcon name="CheckCircle2" animation="scaleIn" {...props} />,
  Check: (props) => <AnimatedIcon name="Check" animation="pop" {...props} />,
  XCircle: (props) => <AnimatedIcon name="CircleX" animation="shake" {...props} />,
  XClose: (props) => <AnimatedIcon name="XIcon" animation="fadeIn" {...props} />,
  AlertCircle: (props) => <AnimatedIcon name="AlertCircle" animation="pulse" {...props} />,
  AlertTriangle: (props) => <AnimatedIcon name="AlertTriangle" animation="wiggle" {...props} />,
  Info: (props) => <AnimatedIcon name="Info" animation="scaleIn" {...props} />,
  HelpCircle: (props) => <AnimatedIcon name="HelpCircle" animation="fadeIn" {...props} />,
  Shield: (props) => <AnimatedIcon name="Shield" animation="fadeIn" {...props} />,
  
  // Actions
  Bell: (props) => <AnimatedIcon name="Bell" animation="wiggle" {...props} />,
  Send: (props) => <AnimatedIcon name="Send" animation="slideInRight" {...props} />,
  Plus: (props) => <AnimatedIcon name="Plus" animation="scaleIn" {...props} />,
  Minus: (props) => <AnimatedIcon name="Minus" animation="scaleIn" {...props} />,
  Trash: (props) => <AnimatedIcon name="Trash2" animation="shake" hover {...props} />,
  Edit: (props) => <AnimatedIcon name="Pencil" animation="fadeIn" hover {...props} />,
  Save: (props) => <AnimatedIcon name="Save" animation="fadeIn" {...props} />,
  X: (props) => <AnimatedIcon name="XIcon" animation="fadeIn" {...props} />,
  Copy: (props) => <AnimatedIcon name="Copy" animation="fadeIn" {...props} />,
  Download: (props) => <AnimatedIcon name="Download" animation="fadeIn" {...props} />,
  Upload: (props) => <AnimatedIcon name="Upload" animation="fadeIn" {...props} />,
  Share: (props) => <AnimatedIcon name="Share2" animation="fadeIn" {...props} />,
  ExternalLink: (props) => <AnimatedIcon name="ExternalLink" animation="fadeIn" {...props} />,
  
  // Navigation
  ChevronRight: (props) => <AnimatedIcon name="ChevronRight" animation="slideInRight" {...props} />,
  ChevronLeft: (props) => <AnimatedIcon name="ChevronLeft" animation="slideInLeft" {...props} />,
  ChevronDown: (props) => <AnimatedIcon name="ChevronDown" animation="fadeIn" {...props} />,
  ChevronUp: (props) => <AnimatedIcon name="ChevronUp" animation="fadeIn" {...props} />,
  ArrowRight: (props) => <AnimatedIcon name="ArrowRight" animation="slideInRight" {...props} />,
  ArrowLeft: (props) => <AnimatedIcon name="ArrowLeft" animation="slideInLeft" {...props} />,
  ArrowUp: (props) => <AnimatedIcon name="ArrowUp" animation="fadeIn" {...props} />,
  ArrowDown: (props) => <AnimatedIcon name="ArrowDown" animation="fadeIn" {...props} />,
  
  // Business
  DollarSign: (props) => <AnimatedIcon name="DollarSign" animation="pulse" {...props} />,
  Wallet: (props) => <AnimatedIcon name="Wallet" animation="fadeIn" {...props} />,
  CreditCard: (props) => <AnimatedIcon name="CreditCard" animation="fadeIn" {...props} />,
  Banknote: (props) => <AnimatedIcon name="Banknote" animation="fadeIn" {...props} />,
  Coins: (props) => <AnimatedIcon name="Coins" animation="fadeIn" {...props} />,
  TrendingUp: (props) => <AnimatedIcon name="TrendingUp" animation="slideInRight" {...props} />,
  TrendingDown: (props) => <AnimatedIcon name="TrendingDown" animation="slideInRight" {...props} />,
  Target: (props) => <AnimatedIcon name="Target" animation="pulse" {...props} />,
  Award: (props) => <AnimatedIcon name="Award" animation="glowPulse" {...props} />,
  Trophy: (props) => <AnimatedIcon name="Trophy" animation="float" {...props} />,
  Medal: (props) => <AnimatedIcon name="Medal" animation="fadeIn" {...props} />,
  Star: (props) => <AnimatedIcon name="Star" animation="glowPulse" {...props} />,
  Sparkles: (props) => <AnimatedIcon name="Sparkles" animation="pulse" {...props} />,
  Zap: (props) => <AnimatedIcon name="Zap" animation="glowPulse" {...props} />,
  Crown: (props) => <AnimatedIcon name="Crown" animation="glowPulse" {...props} />,
  BarChart: (props) => <AnimatedIcon name="BarChart3" animation="fadeIn" {...props} />,
  PieChart: (props) => <AnimatedIcon name="PieChart" animation="fadeIn" {...props} />,
  LineChart: (props) => <AnimatedIcon name="LineChart" animation="fadeIn" {...props} />,
  Activity: (props) => <AnimatedIcon name="Activity" animation="pulse" {...props} />,
  
  // Users
  User: (props) => <AnimatedIcon name="User" animation="fadeIn" {...props} />,
  Users: (props) => <AnimatedIcon name="Users" animation="fadeIn" {...props} />,
  UserPlus: (props) => <AnimatedIcon name="UserPlus" animation="scaleIn" {...props} />,
  UserCheck: (props) => <AnimatedIcon name="UserCheck" animation="fadeIn" {...props} />,
  UserX: (props) => <AnimatedIcon name="UserX" animation="fadeIn" {...props} />,
  
  // Social
  Heart: (props) => <AnimatedIcon name="Heart" animation="heartbeat" {...props} />,
  ThumbsUp: (props) => <AnimatedIcon name="ThumbsUp" animation="pop" {...props} />,
  MessageCircle: (props) => <AnimatedIcon name="MessageCircle" animation="fadeIn" {...props} />,
  Mail: (props) => <AnimatedIcon name="Mail" animation="fadeIn" {...props} />,
  Phone: (props) => <AnimatedIcon name="Phone" animation="fadeIn" {...props} />,
  AtSign: (props) => <AnimatedIcon name="AtSign" animation="fadeIn" {...props} />,
  
  // Time
  Clock: (props) => <AnimatedIcon name="Clock" animation="pulse" {...props} />,
  Calendar: (props) => <AnimatedIcon name="Calendar" animation="fadeIn" {...props} />,
  CalendarDays: (props) => <AnimatedIcon name="CalendarDays" animation="fadeIn" {...props} />,
  Timer: (props) => <AnimatedIcon name="Timer" animation="pulse" {...props} />,
  
  // Files
  FileText: (props) => <AnimatedIcon name="FileText" animation="fadeIn" {...props} />,
  File: (props) => <AnimatedIcon name="File" animation="fadeIn" {...props} />,
  Files: (props) => <AnimatedIcon name="Files" animation="fadeIn" {...props} />,
  Folder: (props) => <AnimatedIcon name="Folder" animation="fadeIn" {...props} />,
  FolderOpen: (props) => <AnimatedIcon name="FolderOpen" animation="fadeIn" {...props} />,
  Image: (props) => <AnimatedIcon name="Image" animation="fadeIn" {...props} />,
  Link: (props) => <AnimatedIcon name="Link2" animation="fadeIn" {...props} />,
  Paperclip: (props) => <AnimatedIcon name="Paperclip" animation="fadeIn" {...props} />,
  
  // Shopping
  ShoppingCart: (props) => <AnimatedIcon name="ShoppingCart" animation="fadeIn" {...props} />,
  ShoppingBag: (props) => <AnimatedIcon name="ShoppingBag" animation="fadeIn" {...props} />,
  Package: (props) => <AnimatedIcon name="Package" animation="fadeIn" {...props} />,
  PackageCheck: (props) => <AnimatedIcon name="PackageCheck" animation="fadeIn" {...props} />,
  Gift: (props) => <AnimatedIcon name="Gift" animation="float" {...props} />,
  Tag: (props) => <AnimatedIcon name="Tag" animation="fadeIn" {...props} />,
  Tags: (props) => <AnimatedIcon name="Tags" animation="fadeIn" {...props} />,
  Receipt: (props) => <AnimatedIcon name="Receipt" animation="fadeIn" {...props} />,
  Percent: (props) => <AnimatedIcon name="Percent" animation="fadeIn" {...props} />,
  
  // Development
  Bug: (props) => <AnimatedIcon name="Bug" animation="wiggle" {...props} />,
  TestTube: (props) => <AnimatedIcon name="TestTube" animation="fadeIn" {...props} />,
  Code: (props) => <AnimatedIcon name="Code" animation="fadeIn" {...props} />,
  Terminal: (props) => <AnimatedIcon name="Terminal" animation="fadeIn" {...props} />,
  Database: (props) => <AnimatedIcon name="Database" animation="fadeIn" {...props} />,
  
  // UI
  Settings: (props) => <AnimatedIcon name="Settings" animation="rotateOnce" hover {...props} />,
  Filter: (props) => <AnimatedIcon name="Filter" animation="fadeIn" {...props} />,
  Search: (props) => <AnimatedIcon name="Search" animation="fadeIn" {...props} />,
  Menu: (props) => <AnimatedIcon name="Menu" animation="fadeIn" {...props} />,
  MoreVertical: (props) => <AnimatedIcon name="MoreVertical" animation="fadeIn" {...props} />,
  MoreHorizontal: (props) => <AnimatedIcon name="MoreHorizontal" animation="fadeIn" {...props} />,
  Grid: (props) => <AnimatedIcon name="Grid" animation="fadeIn" {...props} />,
  List: (props) => <AnimatedIcon name="List" animation="fadeIn" {...props} />,
  MapPin: (props) => <AnimatedIcon name="MapPin" animation="bounce" {...props} />,
  Map: (props) => <AnimatedIcon name="Map" animation="fadeIn" {...props} />,
  Bookmark: (props) => <AnimatedIcon name="Bookmark" animation="fadeIn" {...props} />,
  Flag: (props) => <AnimatedIcon name="Flag" animation="fadeIn" {...props} />,
  Sliders: (props) => <AnimatedIcon name="Sliders" animation="fadeIn" {...props} />,
  
  // Media
  Camera: (props) => <AnimatedIcon name="Camera" animation="fadeIn" {...props} />,
  Video: (props) => <AnimatedIcon name="Video" animation="fadeIn" {...props} />,
  Film: (props) => <AnimatedIcon name="Film" animation="fadeIn" {...props} />,
  Play: (props) => <AnimatedIcon name="Play" animation="scaleIn" {...props} />,
  Pause: (props) => <AnimatedIcon name="Pause" animation="scaleIn" {...props} />,
  Music: (props) => <AnimatedIcon name="Music" animation="fadeIn" {...props} />,
  
  // More Actions
  Pencil: (props) => <AnimatedIcon name="Pencil" animation="fadeIn" {...props} />,
  
  // Nature
  Lightbulb: (props) => <AnimatedIcon name="Lightbulb" animation="glowPulse" {...props} />,
  Leaf: (props) => <AnimatedIcon name="Leaf" animation="float" {...props} />,
  Sun: (props) => <AnimatedIcon name="Sun" animation="glowPulse" {...props} />,
  Moon: (props) => <AnimatedIcon name="Moon" animation="fadeIn" {...props} />,
  Cloud: (props) => <AnimatedIcon name="Cloud" animation="float" {...props} />,
  Droplets: (props) => <AnimatedIcon name="Droplets" animation="fadeIn" {...props} />,
  Flame: (props) => <AnimatedIcon name="Flame" animation="pulse" {...props} />,
  
  // Objects
  Home: (props) => <AnimatedIcon name="Home" animation="fadeIn" {...props} />,
  Store: (props) => <AnimatedIcon name="Store" animation="fadeIn" {...props} />,
  Building: (props) => <AnimatedIcon name="Building2" animation="fadeIn" {...props} />,
  Factory: (props) => <AnimatedIcon name="Factory" animation="fadeIn" {...props} />,
  Warehouse: (props) => <AnimatedIcon name="Warehouse" animation="fadeIn" {...props} />,
  Rocket: (props) => <AnimatedIcon name="Rocket" animation="float" {...props} />,
  Key: (props) => <AnimatedIcon name="Key" animation="fadeIn" {...props} />,
  Lock: (props) => <AnimatedIcon name="Lock" animation="fadeIn" {...props} />,
  Unlock: (props) => <AnimatedIcon name="Unlock" animation="fadeIn" {...props} />,
  Globe: (props) => <AnimatedIcon name="Globe" animation="fadeIn" {...props} />,
  Compass: (props) => <AnimatedIcon name="Compass" animation="fadeIn" {...props} />,
  Briefcase: (props) => <AnimatedIcon name="Briefcase" animation="fadeIn" {...props} />,
  
  // Utility
  Eye: (props) => <AnimatedIcon name="Eye" animation="fadeIn" {...props} />,
  EyeOff: (props) => <AnimatedIcon name="EyeOff" animation="fadeIn" {...props} />,
  Layers: (props) => <AnimatedIcon name="Layers" animation="fadeIn" {...props} />,
  Ban: (props) => <AnimatedIcon name="Ban" animation="shake" {...props} />,
  Fingerprint: (props) => <AnimatedIcon name="Fingerprint" animation="fadeIn" {...props} />,
  ShieldCheck: (props) => <AnimatedIcon name="ShieldCheck" animation="fadeIn" {...props} />,
  ShieldAlert: (props) => <AnimatedIcon name="ShieldAlert" animation="fadeIn" {...props} />,
  Inbox: (props) => <AnimatedIcon name="Inbox" animation="fadeIn" {...props} />,
  QrCode: (props) => <AnimatedIcon name="QrCode" animation="scaleIn" {...props} />,
  MonitorPlay: (props) => <AnimatedIcon name="MonitorPlay" animation="fadeIn" {...props} />,
  Presentation: (props) => <AnimatedIcon name="Presentation" animation="fadeIn" {...props} />,
  ZoomIn: (props) => <AnimatedIcon name="ZoomIn" animation="scaleIn" {...props} />,
  ZoomOut: (props) => <AnimatedIcon name="ZoomOut" animation="scaleIn" {...props} />,
  CornerDownLeft: (props) => <AnimatedIcon name="CornerDownLeft" animation="fadeIn" {...props} />,
  
  // Additional exports for compatibility
  Maximize: (props) => <AnimatedIcon name="Maximize2" animation="fadeIn" {...props} />,
  Minimize: (props) => <AnimatedIcon name="Minimize2" animation="fadeIn" {...props} />
};

export default AnimatedIcon;
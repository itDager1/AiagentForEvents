import React from 'react';
import { Bell, Search, User as UserIcon, Menu, LogOut, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { User } from '../../data/mock';
import compassLogo from 'figma:asset/4d5fe6b6dc3105a55dec739d26b364ba01b8168a.png';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  onLoginClick: () => void;
  onEventsClick: () => void;
}

export function Header({ user, onLogout, onProfileClick, onLoginClick, onEventsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 border-b border-blue-100/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onEventsClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform overflow-hidden">
            <img src={compassLogo} alt="Logo" className="w-full h-full object-cover mix-blend-screen" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline">
            Exact <span className="text-blue-600">Direction</span>
          </span>
        </div>

        {/* Center: Navigation / Search (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
           <nav className="flex gap-6 text-sm font-medium text-slate-600">
             <a onClick={(e) => { e.preventDefault(); onEventsClick(); }} href="#" className="hover:text-blue-600 transition-colors cursor-pointer">События</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Календарь</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Сообщества</a>
           </nav>
           <div className="h-6 w-px bg-gray-200"></div>
           <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              className="pl-10 bg-gray-100/50 border-transparent focus:bg-white focus:border-blue-200 rounded-xl transition-all h-10 text-sm"
              placeholder="Поиск..."
            />
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                <Bell className="w-5 h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 w-10 h-10 overflow-hidden border-2 border-white shadow-sm hover:border-blue-200 transition-all ring-1 ring-gray-100">
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-blue-100 shadow-xl shadow-blue-900/5">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900">{user.name}</p>
                      <p className="text-xs leading-none text-slate-400">{user.email}</p>
                      <Badge variant="secondary" className="mt-2 w-fit text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-blue-50" />
                  <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Мой профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Уведомления</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-blue-50" />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={onLoginClick} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6">
              <LogIn className="w-4 h-4 mr-2" />
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
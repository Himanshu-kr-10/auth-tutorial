"use client"

import React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { LogoutButton } from '@/components/auth/logout-button'
import { UserButton } from '@/components/auth/user-button'

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className='bg-secondary flex items-center 
      justify-between p-4 rounded-xl w-[600px] shadow-sm'>
      <div className='flex gap-2'>
        <Button
          asChild
          variant={pathname === "/server" ? "default" : "outline"}
        >
          <Link href='/server'>
            Server
          </Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/client" ? "default" : "outline"}
        >
          <Link href='/client'>
            Settings
          </Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/admin" ? "default" : "outline"}
        >
          <Link href='/admin'>
            Settings
          </Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/settings" ? "default" : "outline"}
        >
          <Link href='/settings'>
            Settings
          </Link>
        </Button>
      </div>
      <UserButton />
    </nav>
  )
}

export default Navbar
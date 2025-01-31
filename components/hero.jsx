"use client";

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { SignedOut, SignUpButton } from '@clerk/nextjs';

const HeroSection = () => {
    const imgRef= useRef()

    

    useEffect(() => {
            const imageElement = imgRef.current;

            const handleScroll= ()=>{
                const scrollPosition = window.scrollY;
                const scrollThresold= 100;
        
                if(scrollPosition > scrollThresold){
                    imageElement.classList.add("scrolled")
                }else{
                    imageElement.classList.remove("scrolled")
                }
        
            };

            window.addEventListener('scroll',handleScroll);
            
            return () => {
                window.removeEventListener('scroll',handleScroll);
            }
    },[])
  return (
    <div className='pb-20 px-4'>
        <div className='container mx-auto text-center'>
            <h1 className='text-6xl md:text-8xl lg:text-[105px] gradient-title pb-6'>
            Effortlessly Manage Your <br/> Finances with AI
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.
            </p>
            <div className='flex justify-center space-x-4'>
                {/* <Link href="/dashboard">
                   <Button size="lg" className="px-8">
                     Get Started
                   </Button> 
                </Link> */}
                 <SignedOut>
                    <SignUpButton fallbackRedirectUrl='/dashboard'>
                        <Button className="px-8" size="lg">
                        Get Started
                        </Button>
                    </SignUpButton>
                 </SignedOut>

                <Link href="/">
                   <Button size="lg" variant="outline" className="px-8">
                      Watch Demo
                   </Button> 
                </Link>

            </div>

            <div className='hero-image-wrapper'>
                <div ref={imgRef} className='hero-image'>
                    <Image
                      src="/open.jpeg"
                      priority
                      width={1280}
                      height={720}
                      alt='Dashboard preview'
                      className='rounded-lg shadow-2xl border mx-auto'
                    
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeroSection
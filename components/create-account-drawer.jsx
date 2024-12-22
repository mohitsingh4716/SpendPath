"use client";

import React, { useState } from 'react'
import { Drawer, DrawerClose, DrawerContent,   DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { accountShema } from '@/app/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';



const CreateAccountDrawer = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);

    const {register, handleSubmit, formState:{errors}, setValue, watch, reset,}= useForm({
        resolver: zodResolver(accountShema),
        defaultValues:{
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false
        },
    });

    const onSubmit = async(data) => {
        console.log(data);
        
    }

  return (
    <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
  <DrawerTrigger asChild>{children}</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Create New Account</DrawerTitle>
      
    </DrawerHeader>

    <div className='px-4 pb-4'>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor="name">Account Name</label>
            <Input
                id="name"
                placeholder="e.g. Main Checking"
                {...register("name")}
            />
            {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
            )}
         </div>

         <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor="type">Account Type</label>
            <Select onValueChange={(value)=> setValue("type", value)} defaultValue={watch("type")}>

                <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    
                </SelectContent>
            </Select>
            
            {errors.type && (
                <p className='text-sm text-red-500'>{errors.type.message}</p>
            )}
         </div>

         <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor="balance">Initial Balance</label>
            <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
            />
            {errors.balance && (
                <p className='text-sm text-red-500'>{errors.balance.message}</p>
            )}
         </div>


         <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
                <label className='text-sm font-medium cursor-pointer' htmlFor="isDefault">Set as Default</label>

                <p className='text-sm text-muted-foreground '>This account will be selected by default for transactions </p>

            </div>
            <Switch
                id="isDefault"
                onCheckedChange= {(checked)=> setValue("isDefault", checked)}
                checked={watch("isDefault")}
            />

        </div>

        <div className='flex gap-4 pt-4'>
            <DrawerClose asChild>
               <Button type="button" variant="outline" className="flex-1">
                     Cancel
               </Button>
            </DrawerClose>

            <Button type="submit"  className="flex-1">
                Create Account
            </Button>
        </div>
         
        </form>
    </div>
    
  </DrawerContent>
</Drawer>

  )
}

export default CreateAccountDrawer
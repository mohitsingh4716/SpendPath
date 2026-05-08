import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';

export const dynamic = 'force-dynamic';

const AddTransactionPage = async () => {
    const accounts= await getUserAccounts();

  return (
    <div className='max-w-3xl mx-auto px-5'>
        <h1 className='text-5xl gradient-title mb-8'>Add Transaction</h1>

        {accounts?.length ? (
          <AddTransactionForm accounts= {accounts} categories={defaultCategories}/>
        ) : (
          <div className="rounded-md border p-6 text-center text-muted-foreground">
            Create an account before adding transactions.
          </div>
        )}
    </div>
  ) 
}

export default AddTransactionPage

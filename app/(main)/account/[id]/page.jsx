import { getAccountWithTransactions } from '@/actions/accounts'
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import TransactionTable from '../_components/transactions-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/accountChart';
import { getUserInfo } from '@/actions/user';

const AccountPage = async ({params}) => {
    const { id } = await params

    const accountData= await getAccountWithTransactions(id);

    const userInfo = await getUserInfo();

    if(!userInfo){
        notFound();
    }

    if(!accountData){
        notFound();
    }

    const {transactions, ...account}= accountData;
    
    //  { console.log(JSON.stringify(account))};
    //  { console.log(JSON.stringify(userInfo))};

  return (
    <div className='space-y-8 '>
        <div className='px-5 flex gap-4 items-end justify-between'>
            <div>
                <h1 className='text-5xl sm:text-6xl font-bold gradient-title capitalize'>{account.name}</h1>
                <p className='text-muted-foreground'>
                    {account.type.charAt(0)+ account.type.slice(1).toLowerCase()} Account
                </p>
            </div>

            <div className='text-right pb-2'>
                <div className='text-xl sm:text-2xl font-bold'>₹ {parseFloat(account.balance).toFixed(2)}</div>
                <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
            </div>
        </div>

     {/* Chart Section */}


     <Suspense 
     fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea'/>}
     >
        <AccountChart transactions={transactions} userInfo={userInfo}/>
     </Suspense>

     {/* Transactions Table */}

     <Suspense 
     fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea'/>}
     >
        <TransactionTable transactions={transactions}/>
     </Suspense>
    
        
    </div>
  )
}

export default AccountPage
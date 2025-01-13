import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";

import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection/>


     <section className="py-20 bg-blue-50  dark:bg-white/55">
       <div className="container mx-auto px-4">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {
            statsData.map((statData, index)=>(
              <div key={index} className="text-center"> 
              <div className="text-4xl font-bold text-blue-600 mb-2"> {statData.value}</div>
              <div className="text-gray-600 dark:text-black"> {statData.label}</div>
              </div>
            ))
           }
         </div>
       </div>
     </section>
     
     <section id="features" className=" py-20">
      <div className="container mx-auto  px-4">
        <h2 className="text-center text-3xl font-bold "> Everything you need to manage your finances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {
            featuresData.map((feature, index)=>(
              <Card key={index} className="p-6  pt-4"> 
                  <CardContent className=" space-y-4">
                   {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                 
              </Card>
            ))
          }
        </div>
      </div>
     </section>

     <section className="py-20 bg-blue-50  dark:bg-white/55">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold dark:text-black">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {
            howItWorksData.map((data, index)=>(
              <div key={index} className="p-6 space-y-4 text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                {data.icon}
                </div>
                <h3 className="text-xl  font-semibold dark:text-black">{data.title}</h3>
                <p className="text-gray-600">{data.description}</p>
              </div>
            ))
          }

        </div>
      </div>
     </section>

     <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
             {
                testimonialsData.map((data, index)=>{
                  return (
                    <Card key={index} className="p-6">
                     <CardContent>
                      <div className="flex items-center space-x-4">
                       
                        <Image
                      src={data.image}
                      alt={data.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                        <div>
                          <h3 className="text-lg font-semibold">{data.name}</h3>
                          <p className="text-gray-600 text-sm">{data.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-4">{data.quote}</p>
                     </CardContent>
                  </Card>
                  )
                })
             }
            
          </div>
        </div>
     </section>

       <section className="py-20 bg-blue-600">
        <div className="container mx-auto text-center text-white px-4">
          <h1 className="text-center text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h1>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of users who are already managing their finances smarter with Welth</p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 animate-bounce"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
       </section>
      
    </div>
  )
}

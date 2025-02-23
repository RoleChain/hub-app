// "use client"

// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Copy, Send } from "lucide-react"
// import Image from "next/image"
// import icon1 from "@/assets/images/Ellipse 1 (1).png"
// import icon2 from "@/assets/images/Ellipse 1 (2).png"
// const templates = [
//   {
//     id: 1,
//     name: "Hacker News Reporter",
//     icon: icon2,
//     creator: {
//       name: "Jenny Wilson",
//       avatar: icon1,
//     },
//   },
//   {
//     id: 2,
//     name: "FAQ Write",
//     icon: icon2,
//     creator: {
//       name: "Floyd Miles",
//       avatar: icon1,
//     },
//   },
//   {
//     id: 3,
//     name: "Magic Hour Manager",
//     icon: icon2,
//     creator: {
//       name: "Courtney Henry",
//       avatar: icon1,
//     },
//   },
//   {
//     id: 4,
//     name: "SEO Optimized Blog",
//     icon: icon2,
//     creator: {
//       name: "Albert Flores",
//       avatar: icon1,
//     },
//   },
//   {
//     id: 5,
//     name: "Integration Builder",
//     icon: icon2,
//     creator: {
//       name: "Ralph Edwards",
//       avatar: icon1,
//     },
//   },
//   {
//     id: 6,
//     name: "Linear Sprint summary",
//     icon: icon2,
//     creator: {
//       name: "Kathryn Murphy",
//       avatar: icon1,
//     },
//   },
// ]

// export function AgentTemplateSection() {
//   return (
//     <div className="flex flex-col items-center gap-6 px-10 py-8">
//       <div className="flex flex-col items-center text-center">
//         <div className="inline-flex items-center gap-2 rounded-full bg-[#FF4800] px-4 py-1 text-sm text-white">
//           Agent Template
//         </div>
//         <h2 className="mt-4 text-2xl  text-black font-bold sm:text-3xl">Supercharge Your Workflow with AI Agents</h2>
//         <p className="mt-2 text-sm text-gray-400 sm:text-base">
//           Boost productivity and automate tasks effortlessly with ready-to-use AI Agent templates.
//         </p>
//       </div>

//       <Tabs defaultValue="top" className="w-full  ">
//         <TabsList className="grid w-full max-w-[400px] grid-cols-3 rounded-full">
//           <TabsTrigger value="top" className="data-[state=active]:bg-[#F700F7] rounded-2xl">
//             Top Template
//           </TabsTrigger>
//           <TabsTrigger value="hot" className="data-[state=active]:bg-[#F700F7] rounded-2xl">Hot Template</TabsTrigger>
//           <TabsTrigger value="best" className="data-[state=active]:bg-[#F700F7] rounded-2xl">Best Template</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {templates.map((template) => (
//           <Card key={template.id} className="bg-white/5 backdrop-blur-sm">
//             <CardHeader className="flex-row items-center gap-3 space-y-0">
//               <Image
//                 src={template.icon || "/placeholder.svg"}
//                 alt={template.name}
//                 width={48}
//                 height={48}
//                 className="rounded-xl"
//               />
//               <div>
//                 <h3 className="font-semibold text-black">{template.name}</h3>
//                 <div className="mt-1 flex items-center gap-1.5">
//                   <span className="text-sm text-gray-400">By :</span>
//                   <Image
//                     src={template.creator.avatar || "/placeholder.svg"}
//                     alt={template.creator.name}
//                     width={24}
//                     height={24}
//                     className="rounded-full"
//                   />
//                   <span className="text-sm text-gray-400">{template.creator.name}</span>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 variant="ghost"
//                 className="w-full  text-[#F700F7] hover:bg-white/10 hover:text-[#F700F7]  bg-[#FDE9FE] rounded-[12px]"
//               >
//                 <Copy className="mr-2 h-4 w-4" />
//                 Clone Now
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="relative mt-4 w-full max-w-[600px]">
//         <Input
//           type="text"
//           placeholder="Start your Research"
//           className="w-full rounded-full border-white/10 bg-white/5 pl-10 pr-12 text-white placeholder:text-gray-400"
//         />
//         <div className="absolute inset-y-0 left-3 flex items-center">
        
//         </div>
//         <div className="absolute inset-y-0 right-3 flex items-center">
//           <Send className="h-5 w-5 text-[#F700F7]" />
//         </div>
//       </div>
//     </div>
//   )
// }


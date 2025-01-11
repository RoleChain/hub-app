'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ApprovalMessage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-center space-y-6 p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Approval Pending</h1>
          <div className="flex justify-center my-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-[#AACD1D]" />
            </motion.div>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            We're currently reviewing your request. Please check back later.
          </p>
        </motion.div>
        <Button className="bg-[#AACD1D] text-white font-bold py-2 px-4 rounded">
          Return Home
        </Button>
      </div>
    </div>
  )
}

export default ApprovalMessage


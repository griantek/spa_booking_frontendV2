"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-pink-900 p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="max-w-md w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="flex flex-col gap-3 px-8 pt-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center"
            >
              <span className="text-3xl">🎉</span>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Exclusive Offer!
            </h1>
          </CardHeader>
          <CardBody className="px-8">
            <p className="text-xl text-gray-200 leading-relaxed">
              Unlock an incredible{" "}
              <span className="font-bold text-pink-300">50% discount</span> on
              your first purchase! This exclusive offer won&apos;t last long.
              <span className="block mt-2 text-sm text-gray-300">
                Limited time only. Terms and conditions apply.
              </span>
            </p>
          </CardBody>
          <CardFooter className="px-8 pb-8">
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-6 text-lg
                         transform transition-all hover:scale-105 hover:shadow-lg hover:from-pink-600 hover:to-purple-600"
              variant="solid"
            >
              Claim Your 50% Off Now
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

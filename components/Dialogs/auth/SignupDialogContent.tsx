import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import React, { ChangeEvent } from "react";

const SignupDialogContent = ({ login }: { login: () => void }) => {
  const onSingup = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Sign up successfull!");
  };
  return (
    <div className="bg-[radial-gradient(277.58%_98.91%_at_50%_0%,_rgba(171,_206,_30,_0.20)_0%,_rgba(255,_255,_255,_0.00)_100%),_#FFF]">
      <DialogHeader className="flex flex-col items-center justify-center text-center">
        <p className="mb-4 text-lg font-semibold">Research AI</p>
        <DialogTitle className="text-2xl">Sign up</DialogTitle>
        <DialogDescription>Please enter your details.</DialogDescription>
      </DialogHeader>
      <form
        className="mt-3 flex flex-col gap-4"
        onSubmit={onSingup}
      >
        <label className="text-sm">
          <p>Name*</p>
          <Input
            placeholder="Enter your name"
            className="mt-1 text-sm"
            required
            type="text"
          />
        </label>{" "}
        <label className="text-sm">
          <p>Email*</p>
          <Input
            placeholder="Enter your email"
            className="mt-1 text-sm"
            required
            type="email"
          />
        </label>{" "}
        <label className="mb-2 text-sm">
          <p>Password*</p>
          <Input
            placeholder="Create Password"
            className="my-1 text-sm"
            required
            type="password"
          />
          <p className="text-xs text-secondary-foreground">
            Must be at least 8 characters.
          </p>
        </label>
        <Button>Get started</Button>
      </form>
      <div className="mt-8 flex flex-col items-center justify-center gap-6">
        <p className="text-xs text-secondary-foreground">
          Already have an account?{" "}
          <span
            onClick={login}
            className="cursor-pointer font-medium text-primary"
          >
            Log in
          </span>
        </p>
        <p className="text-xs text-secondary-foreground">
          Research AI © 2024 all rights reserved. privacy policy | t&c
        </p>{" "}
      </div>
    </div>
  );
};

export default SignupDialogContent;

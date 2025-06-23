import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Mail,
  BadgeCheck,
  Key,
  Link2,
  ShieldAlert,
  Trash2,
  Activity,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center bg-slate-950 px-4 py-10">
      {/* Profile Header */}
      <Card className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8 px-8 py-8 mb-10">
        <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
          <Avatar className="w-24 h-24 bg-indigo-500/50">
            <AvatarImage src="/avatar.png" alt="User avatar" />
            <AvatarFallback className="text-3xl">RB</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 bg-indigo-600/20 px-3 py-1 rounded-full">
            <BadgeCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-indigo-200 font-semibold">
              Premium Plan
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-300" />
            <span className="text-2xl font-bold text-white">Raghu Bhat</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-base">raghu@example.com</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Label htmlFor="phone" className="text-slate-400">
              Phone:
            </Label>
            <Input
              id="phone"
              value="+91 98765 43210"
              readOnly
              className="bg-slate-800 border-slate-700 text-slate-300 w-40"
            />
          </div>
        </div>
      </Card>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-slate-300">
              <div>
                Plan:{" "}
                <span className="font-semibold text-indigo-400">Premium</span>
              </div>
              <div>Member since: Jan 2024</div>
              <div>Last login: 2 hours ago</div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-slate-800 border-slate-700 text-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-slate-800 border-slate-700 text-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-slate-800 border-slate-700 text-slate-300"
                />
              </div>
              <Button type="submit" className="mt-2">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Linked Social Accounts */}
        <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Link2 className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Linked Social Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-300 flex items-center gap-2">
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              Google (linked){" "}
              <span className="ml-2 text-xs text-slate-500">
                (Unlink coming soon)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-lg text-white">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for delete confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="text-slate-300 mb-4">
            This action cannot be undone. Your account and all data will be
            permanently deleted.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(false)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Activity */}
      <div className="w-full max-w-4xl mt-10">
        <Card className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400">
              Recent trips and activity will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

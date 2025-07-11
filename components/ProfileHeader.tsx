"use client";

import { Text } from "react-native";

interface ProfileHeaderProps {
  title: string;
  className?: string;
}

const ProfileHeader = ({ title, className = "" }: ProfileHeaderProps) => {
  return (
    <Text
      className={`text-center text-[1.7rem] font-NunitoBold py-3 mb-2 ${className}`}
    >
      {title}
    </Text>
  );
};

export default ProfileHeader;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { WrenchScrewdriverIcon, CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from "react-native-heroicons/outline";
import { CheckBadgeIcon, ClockIcon, ExclamationCircleIcon } from "react-native-heroicons/solid";

import { RepairHistoryItem } from "@/lib/api/products";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProductRepairHistoryProps {
  repairHistory: RepairHistoryItem[];
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", icon: ClockIcon },
  arrived: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", icon: InformationCircleIcon },
  verify_completed: { label: "Verify Completed", bg: "bg-indigo-100", text: "text-indigo-700", icon: CheckBadgeIcon },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: CheckBadgeIcon },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", icon: ExclamationCircleIcon },
};

const RepairItem = ({ repair }: { repair: RepairHistoryItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[repair.status.toLowerCase()] || { label: repair.status, bg: "bg-gray-100", text: "text-gray-700", icon: InformationCircleIcon };
  const StatusIcon = status.icon;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="mb-4 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      <TouchableOpacity 
        onPress={toggleExpand}
        activeOpacity={0.7}
        className="p-4 flex-row items-center justify-between"
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`px-2 py-0.5 rounded-full ${status.bg} flex-row items-center mr-2`}>
              <StatusIcon size={12} color={status.text.includes('amber') ? '#B45309' : status.text.includes('blue') ? '#1D4ED8' : status.text.includes('indigo') ? '#4338CA' : status.text.includes('green') ? '#059669' : '#374151'} />
              <Text className={`text-[10px] font-NunitoBold ml-1 ${status.text}`}>{status.label}</Text>
            </View>
            <Text className="text-xs text-gray-400 font-NunitoMedium">{formatDate(repair.requested_at)}</Text>
          </View>
          <Text className="text-sm font-NunitoBold text-gray-900 capitalize">
            {repair.service_type.replace('_', ' ')}
          </Text>
        </View>
        <View className="ml-2">
          {isExpanded ? <ChevronUpIcon size={20} color="#9CA3AF" /> : <ChevronDownIcon size={20} color="#9CA3AF" />}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4 border-t border-gray-100 pt-3">
          <View className="mb-3">
            <Text className="text-[11px] text-gray-400 font-NunitoSemiBold uppercase tracking-wider mb-1">Problem Description</Text>
            <Text className="text-sm text-gray-600 font-NunitoMedium leading-5">
              {repair.problem_description}
            </Text>
          </View>

          {repair.problem_resolutions && repair.problem_resolutions.length > 0 && (
            <View className="mt-2 bg-white p-3 rounded-xl border border-gray-100">
              <Text className="text-[11px] text-gray-400 font-NunitoSemiBold uppercase tracking-wider mb-2">Resolution details</Text>
              {repair.problem_resolutions.map((res, idx) => (
                <View key={idx} className="flex-row items-start mb-2">
                   <View className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2" />
                   <Text className="flex-1 text-xs text-gray-600 font-NunitoMedium leading-5">
                     {res.description}
                   </Text>
                </View>
              ))}
            </View>
          )}

          {repair.service_address && (
            <View className="mt-3 flex-row items-center">
              <InformationCircleIcon size={14} color="#9CA3AF" />
              <Text className="text-[11px] text-gray-400 font-NunitoMedium ml-1" numberOfLines={1}>
                {repair.service_address}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const ProductRepairHistory: React.FC<ProductRepairHistoryProps> = ({ repairHistory }) => {
  if (!repairHistory || repairHistory.length === 0) return null;

  return (
    <View 
      className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
           <View className="w-8 h-8 bg-primary-100 rounded-lg items-center justify-center mr-3">
              <WrenchScrewdriverIcon size={18} color="#D30309" />
           </View>
           <View>
             <Text className="text-base font-NunitoBold text-gray-900">Repair History</Text>
             <Text className="text-[10px] text-gray-400 font-NunitoMedium">Verified service records</Text>
           </View>
        </View>
        <View className="bg-gray-100 px-2 py-1 rounded-md">
          <Text className="text-[10px] font-NunitoBold text-gray-600">{repairHistory.length} Jobs</Text>
        </View>
      </View>

      <View>
        {repairHistory.map((repair) => (
          <RepairItem key={repair.id} repair={repair} />
        ))}
      </View>

      <View className="mt-2 items-center flex-row justify-center p-2 bg-blue-50 rounded-xl">
         <InformationCircleIcon size={14} color="#3B82F6" />
         <Text className="text-[10px] text-blue-700 font-NunitoSemiBold ml-1.5">
           Records are strictly based on account service history for this VIN.
         </Text>
      </View>
    </View>
  );
};

export default ProductRepairHistory;

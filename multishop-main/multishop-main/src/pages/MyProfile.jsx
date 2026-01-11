import React from "react";

// Hooks
import {
  useProfileUser,
  useLoyaltyAccount,
  useCustomerRecord,
  useMyOrders,
  useMyTenant,
  useUserProfileData,
  useProfileForm,
  useUpdateCustomer
} from "@/components/hooks/useMyProfile";

// Components
import ProfileSidebar from "@/components/myprofile/ProfileSidebar";
import ProfilePersonalInfo from "@/components/myprofile/ProfilePersonalInfo";
import ProfileShippingEditor from "@/components/myprofile/ProfileShippingEditor";
import ProfileLoyalty from "@/components/myprofile/ProfileLoyalty";
import ProfileTierProgress from "@/components/myprofile/ProfileTierProgress";
import ProfileRecentOrders from "@/components/myprofile/ProfileRecentOrders";
import ProfileLoadingState from "@/components/myprofile/ProfileLoadingState";

export default function MyProfile() {
  // Data hooks
  const { data: user, isLoading: userLoading } = useProfileUser();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyAccount(user?.email);
  const { data: customer } = useCustomerRecord(user?.email);
  const { data: myOrders = [] } = useMyOrders(user?.email);
  const { data: myTenant } = useMyTenant(user?.email);
  const { data: userProfile } = useUserProfileData(user?.email);
  
  // Form hooks
  const { isEditing, setIsEditing, formData, setFormData } = useProfileForm(customer, user);
  const updateMutation = useUpdateCustomer(customer, user);

  const handleSave = () => {
    updateMutation.mutate(formData, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (userLoading || loyaltyLoading) {
    return <ProfileLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Tài Khoản Của Tôi</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <ProfileSidebar 
            user={user} 
            userProfile={userProfile} 
            loyalty={loyalty} 
            myTenant={myTenant} 
          />

          <div className="lg:col-span-2 space-y-6">
            <ProfilePersonalInfo
              user={user}
              customer={customer}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              isSaving={updateMutation.isLoading}
            />
            
            <ProfileShippingEditor userEmail={user?.email} />

            <ProfileLoyalty loyalty={loyalty} />
            <ProfileTierProgress loyalty={loyalty} />
            <ProfileRecentOrders orders={myOrders} />
          </div>
        </div>
      </div>
    </div>
  );
}
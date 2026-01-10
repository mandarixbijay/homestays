// components/admin/ImprovedHomestayDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Trash2, Check, X, MapPin, Phone, User, Star,
  Wifi, Bed, Users, Square, DollarSign, Camera, Calendar, Shield,
  AlertCircle, Home, Eye, Download, Share, Copy, ExternalLink
} from 'lucide-react';

import {
  useHomestayDetail,
  useAsyncOperation
} from '@/hooks/useAdminApi';

import {
  LoadingSpinner,
  Alert,
  ActionButton,
  Card,
  StatusBadge,
  Modal,
  Input,
  TextArea,
  useToast
} from '@/components/admin/AdminComponents';

// ============================================================================
// TYPES
// ============================================================================

interface ApprovalData {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const ImageGallery: React.FC<{
  images: any[];
  title: string;
  onViewImage: (url: string) => void;
}> = ({ images, title, onViewImage }) => {
  if (!images || images.length === 0) {
    return (
      <Card title={title}>
        <div className="text-center py-8">
          <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No images available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`${title} (${images.length})`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image: any, index: number) => (
          <div key={image.id || index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200">
              <img
                src={image.url}
                alt={`${title} ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onClick={() => onViewImage(image.url)}
              />
              {image.isMain && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1A403D] text-white shadow-lg">
                    ★ Main
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const PropertyInfo: React.FC<{ homestay: any }> = ({ homestay }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card title="Property Information" className="h-fit">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <StatusBadge status={homestay.status} />
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-500 block">Address</span>
              <p className="text-sm text-gray-900 mt-1 break-words">{homestay.address}</p>
              <ActionButton
                onClick={() => copyToClipboard(homestay.address)}
                variant="secondary"
                size="xs"
                icon={<Copy className="h-3 w-3" />}
                className="mt-2"
              >
                Copy
              </ActionButton>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <span className="text-sm font-medium text-gray-500 block">Contact</span>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-900">{homestay.contactNumber}</p>
                <ActionButton
                  onClick={() => copyToClipboard(homestay.contactNumber)}
                  variant="secondary"
                  size="xs"
                  icon={<Copy className="h-3 w-3" />}
                />
              </div>
            </div>
          </div>

          {homestay.rating && (
            <div className="flex items-center space-x-3">
              <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-500 block">Rating</span>
                <p className="text-sm text-gray-900 mt-1">
                  {homestay.rating} ({homestay.reviews} reviews)
                </p>
              </div>
            </div>
          )}

          {homestay.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Discount</span>
              <span className="text-sm font-medium text-green-600">{homestay.discount}%</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">VIP Access</span>
            <StatusBadge status={homestay.vipAccess ? 'Yes' : 'No'} variant="small" />
          </div>
        </div>
      </div>
    </Card>
  );
};

const OwnerInfo: React.FC<{ owner: any }> = ({ owner }) => {
  return (
    <Card title="Owner Information">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-[#1A403D]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{owner.name}</h4>
            <p className="text-sm text-gray-500">ID: {owner.id}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="text-gray-900">{owner.email}</span>
          </div>

          {owner.mobileNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile:</span>
              <span className="text-gray-900">{owner.mobileNumber}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-500">Role:</span>
            <StatusBadge status={owner.role} variant="small" />
          </div>
        </div>
      </div>
    </Card>
  );
};

const TimestampInfo: React.FC<{ homestay: any }> = ({ homestay }) => {
  return (
    <Card title="Timeline">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <span className="text-sm font-medium text-gray-500 block">Created</span>
            <p className="text-sm text-gray-900">
              {new Date(homestay.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <span className="text-sm font-medium text-gray-500 block">Last Updated</span>
            <p className="text-sm text-gray-900">
              {new Date(homestay.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FacilitiesSection: React.FC<{ facilities: any[] }> = ({ facilities }) => {
  if (!facilities || facilities.length === 0) {
    return (
      <Card title="Facilities">
        <p className="text-gray-500 text-sm">No facilities listed</p>
      </Card>
    );
  }

  // Deduplicate facilities by name to avoid displaying duplicates
  const uniqueFacilities = Array.from(
    new Map(
      facilities.map((f) => [f.facility.name.toLowerCase(), f])
    ).values()
  );

  return (
    <Card title={`Facilities (${uniqueFacilities.length})`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {uniqueFacilities.map((homestayFacility: any, index: number) => (
          <div
            key={homestayFacility.id ?? `facility-${index}`} // Fallback to index if id is undefined
            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
          >
            <Wifi className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {homestayFacility.facility?.name ?? 'Unknown Facility'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};


const RoomCard: React.FC<{
  room: any;
  onViewImages: (images: any[]) => void
}> = ({ room, onViewImages }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {room.name}
            </h3>
            {room.description && (
              <p className="text-sm text-gray-500 mt-1">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Square className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {room.totalArea} {room.areaUnit}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {room.minOccupancy}-{room.maxOccupancy} guests
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {room.price} {room.currency}
            </span>
          </div>

          <div className="flex items-center">
            <StatusBadge
              status={room.includeBreakfast ? 'Breakfast Included' : 'No Breakfast'}
              variant="small"
            />
          </div>
        </div>

        {/* Beds */}
        {room.beds && room.beds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Beds</h4>
            <div className="flex flex-wrap gap-2">
              {room.beds.map((bed: any) => (
                <span key={bed.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Bed className="h-3 w-3 mr-1" />
                  {bed.quantity}x {bed.bedType.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Room Images */}
        {room.images && room.images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                Room Images ({room.images.length})
              </h4>
              <ActionButton
                onClick={() => onViewImages(room.images)}
                variant="secondary"
                size="xs"
                icon={<Eye className="h-3 w-3" />}
              >
                View All
              </ActionButton>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {room.images.slice(0, 4).map((image: any, index: number) => (
                <div key={image.id} className="relative flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`${room.name} ${index + 1}`}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => onViewImages(room.images)}
                  />
                  {image.isMain && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <Star className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {room.images.length > 4 && (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <span className="text-xs text-gray-500">
                    +{room.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const ApprovalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  homestay: any;
  status: 'APPROVED' | 'REJECTED';
  onSubmit: (data: ApprovalData) => Promise<void>;
}> = ({ isOpen, onClose, homestay, status, onSubmit }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const { loading, execute } = useAsyncOperation();

  const handleSubmit = async () => {
    try {
      await execute(() => onSubmit({ status, rejectionReason }));
      onClose();
      setRejectionReason('');
    } catch (error) {
      // Error handled by useAsyncOperation
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${status === 'APPROVED' ? 'Approve' : 'Reject'} Homestay`}
      footer={
        <>
          <ActionButton onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleSubmit}
            variant={status === 'APPROVED' ? 'success' : 'danger'}
            loading={loading}
            disabled={status === 'REJECTED' && !rejectionReason.trim()}
          >
            {status === 'APPROVED' ? 'Approve' : 'Reject'}
          </ActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Are you sure you want to {status.toLowerCase()} &quot;{homestay?.name}&quot;?
        </p>

        {status === 'REJECTED' && (
          <TextArea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            rows={3}
            required
            error={status === 'REJECTED' && !rejectionReason.trim() ? 'Rejection reason is required' : undefined}
          />
        )}
      </div>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface HomestayDetailViewProps {
  homestayId: string;
}

export default function ImprovedHomestayDetail({ homestayId }: HomestayDetailViewProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const {
    homestay,
    loading,
    error,
    loadHomestay,
    updateHomestay,
    clearError
  } = useHomestayDetail(parseInt(homestayId));

  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Effects
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadHomestay();
    }
  }, [status, session, router, loadHomestay]);

  // Handlers
  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this homestay? This action cannot be undone.')) return;

    try {
      // Add delete functionality here
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Homestay deleted successfully'
      });
      router.push('/admin/homestays');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete homestay'
      });
    }
  }, [addToast, router]);

  const handleApproval = useCallback((status: 'APPROVED' | 'REJECTED') => {
    setApprovalStatus(status);
    setShowApprovalModal(true);
  }, []);

  const submitApproval = useCallback(async (data: ApprovalData) => {
    // Add approval functionality here
    await loadHomestay();
    addToast({
      type: 'success',
      title: 'Success',
      message: `Homestay ${data.status.toLowerCase()} successfully`
    });
  }, [loadHomestay, addToast]);

  const handleViewImages = useCallback((images: any[]) => {
    setSelectedImages(images);
    setShowImageGallery(true);
  }, []);

  const handleShare = useCallback(() => {
    const shareData = {
      title: homestay.name,
      text: homestay.description,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Homestay link copied to clipboard'
      });
    }
  }, [homestay, addToast]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(homestay, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `homestay-${homestay.id}-data.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [homestay]);

  // Early returns
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading homestay details..." />
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Error"
          message={error}
          actions={
            <ActionButton onClick={() => router.push('/admin/homestays')} variant="secondary">
              Back to Homestays
            </ActionButton>
          }
        />
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          type="error"
          title="Not Found"
          message="Homestay not found"
          actions={
            <ActionButton onClick={() => router.push('/admin/homestays')} variant="secondary">
              Back to Homestays
            </ActionButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={() => router.push('/admin/homestays')}
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </ActionButton>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {homestay.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Homestay Details
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {homestay.status === 'PENDING' && (
                <>
                  <ActionButton
                    onClick={() => handleApproval('APPROVED')}
                    variant="success"
                    icon={<Check className="h-4 w-4" />}
                  >
                    Approve
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleApproval('REJECTED')}
                    variant="danger"
                    icon={<X className="h-4 w-4" />}
                  >
                    Reject
                  </ActionButton>
                </>
              )}

              <ActionButton
                onClick={handleShare}
                variant="secondary"
                icon={<Share className="h-4 w-4" />}
              >
                Share
              </ActionButton>

              <ActionButton
                onClick={exportData}
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </ActionButton>

              <ActionButton
                onClick={() => router.push(`/admin/homestays/${homestayId}/edit`)}
                variant="secondary"
                icon={<Edit className="h-4 w-4" />}
              >
                Edit
              </ActionButton>

              <ActionButton
                onClick={handleDelete}
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {homestay.status === 'REJECTED' && homestay.rejectionReason && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Homestay Rejected"
              message={homestay.rejectionReason}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <ImageGallery
              images={homestay.images || []}
              title="Homestay Images"
              onViewImage={setSelectedImage}
            />

            {/* Description */}
            <Card title="Description">
              {homestay.description ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {homestay.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </Card>

            {/* Facilities */}
            <FacilitiesSection facilities={homestay.facilities || []} />

            {/* Rooms */}
            <Card title={`Rooms (${homestay.rooms?.length || 0})`}>
              {!homestay.rooms || homestay.rooms.length === 0 ? (
                <div className="text-center py-8">
                  <Bed className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No rooms added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {homestay.rooms.map((room: any) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onViewImages={handleViewImages}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PropertyInfo homestay={homestay} />
            <OwnerInfo owner={homestay.owner} />
            <TimestampInfo homestay={homestay} />
          </div>
        </div>
      </div>

      {/* Single Image Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Image Preview"
          size="xl"
        >
          <img
            src={selectedImage}
            alt="Full size preview"
            className="w-full h-auto rounded-lg"
          />
        </Modal>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <Modal
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
          title={`Image Gallery (${selectedImages.length})`}
          size="full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedImages.map((image, index) => (
              <div key={image.id || index} className="relative">
                <img
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setSelectedImage(image.url)}
                />
                {image.isMain && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1A403D] text-white">
                      ★ Main
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        homestay={homestay}
        status={approvalStatus}
        onSubmit={submitApproval}
      />
    </div>
  );
}
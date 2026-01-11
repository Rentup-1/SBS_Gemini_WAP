import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserPlus } from "lucide-react";
import { getUserByPhone } from "@/api/auth";
import { InlineLoader } from "@/components/common/LoadingSpinner";

interface UserStatusCellProps {
  phone: string;
  onNewUserClick?: () => void;
}

export const UserStatusCell = ({
  phone,
  onNewUserClick,
}: UserStatusCellProps) => {
  // 1. Fetch user status for this specific row
  const { data: user, isLoading } = useQuery({
    queryKey: ["check-user-cell", phone],
    queryFn: () => getUserByPhone(phone),
    staleTime: 1000 * 60 * 10, // Cache results for 10 mins (Important for performance!)
    enabled: !!phone,
  });

  if (isLoading) {
    return <InlineLoader />;
  }

  if (user) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200 gap-1 hover:bg-green-100 whitespace-nowrap"
      >
        <UserCheck className="w-3 h-3" /> Existing
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-amber-50 text-amber-700 border-amber-200 gap-1 cursor-pointer hover:bg-amber-100 whitespace-nowrap"
      onClick={onNewUserClick}
      title="Click to send registration link"
    >
      <UserPlus className="w-3 h-3" /> New
    </Badge>
  );
};

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CheckCircle2, Clock, Target, TrendingUp, Users, FileText, Ship } from 'lucide-react';
import TaskCard from '../components/management/TaskCard';
import CreateTaskModal from '../components/management/CreateTaskModal';
import KPICard from '../components/management/KPICard';

export default function MyWorkspace() {
  const [user, setUser] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: myTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ assigned_to: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: myRFQs = [] } = useQuery({
    queryKey: ['my-rfqs', user?.email],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.RFQ.list('-created_date', 100);
      }
      return base44.entities.RFQ.filter({ 
        $or: [
          { assigned_sales: user.email },
          { assigned_pricing: user.email },
          { client_email: user.email }
        ]
      }, '-created_date', 100);
    },
    enabled: !!user?.email,
  });

  const { data: myShipments = [] } = useQuery({
    queryKey: ['my-shipments', user?.email],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Shipment.list('-created_date', 100);
      }
      return base44.entities.Shipment.filter({
        $or: [
          { assigned_operations: user.email },
          { client_email: user.email }
        ]
      }, '-created_date', 100);
    },
    enabled: !!user?.email,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });

  const handleTaskStatusChange = (task, newStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: {
        ...task,
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : undefined,
      },
    });
  };

  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const blockedTasks = myTasks.filter(t => t.status === 'blocked');

  const activeRFQs = myRFQs.filter(r => !['cancelled', 'rejected', 'won', 'lost'].includes(r.status));
  const activeShipments = myShipments.filter(s => s.status !== 'delivered');

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Workspace</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tasks and track your performance</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)} className="bg-[#D50000] hover:bg-[#B00000]">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="In Progress"
          value={inProgressTasks.length}
          icon={Target}
          color="blue"
        />
        <KPICard
          title="Completed"
          value={completedTasks.length}
          icon={CheckCircle2}
          color="green"
        />
        <KPICard
          title="Active RFQs"
          value={activeRFQs.length}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Ship className="w-5 h-5 text-[#D50000]" />
            <h3 className="font-semibold text-[#1A1A1A]">Active Shipments</h3>
          </div>
          <p className="text-3xl font-bold text-[#1A1A1A]">{activeShipments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Shipments in progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#D50000]" />
            <h3 className="font-semibold text-[#1A1A1A]">This Week</h3>
          </div>
          <p className="text-3xl font-bold text-[#1A1A1A]">
            {completedTasks.filter(t => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(t.completed_date || 0) > weekAgo;
            }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tasks completed</p>
        </div>
      </div>

      {/* Tasks by Status */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
          {blockedTasks.length > 0 && (
            <TabsTrigger value="blocked">
              Blocked ({blockedTasks.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending tasks</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks in progress</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No completed tasks yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        {blockedTasks.length > 0 && (
          <TabsContent value="blocked" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {blockedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={() => queryClient.invalidateQueries({ queryKey: ['my-tasks'] })}
      />
    </div>
  );
}
// src/components/customers/VehicleList.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteVehicle } from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { Truck, Plus, Edit, Trash, AlertCircle } from 'lucide-react';

const VehicleList = ({ customerId, vehicles = [], refreshVehicles }) => {
  const [deleting, setDeleting] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Handle vehicle deletion
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setDeleting(true);
      await deleteVehicle(vehicleToDelete.id);
      notification.success('Vehicle deleted successfully');
      
      // Refresh the vehicles list
      if (refreshVehicles) await refreshVehicles();
      
      // Close the dialog
      setVehicleToDelete(null);
    } catch (error) {
      notification.error(`Failed to delete vehicle: ${error.message}`);
      console.error('Error deleting vehicle:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Vehicles</h2>
        <Button 
          onClick={() => navigate(`/vehicles/new?customer=${customerId}`)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
      
      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vehicles</h3>
            <p className="text-muted-foreground mb-4">
              This customer doesn't have any registered vehicles yet.
            </p>
            <Button 
              onClick={() => navigate(`/vehicles/new?customer=${customerId}`)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {vehicle.registrationNumber}
                </CardTitle>
                {vehicle.description && (
                  <CardDescription>{vehicle.description}</CardDescription>
                )}
              </CardHeader>
              <CardFooter className="pt-2 justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setVehicleToDelete(vehicle)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      {vehicleToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-xl font-bold mb-4">Delete Vehicle</h3>
            <p className="mb-6">
              Are you sure you want to delete vehicle <span className="font-bold">{vehicleToDelete.registrationNumber}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setVehicleToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteVehicle}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Vehicle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
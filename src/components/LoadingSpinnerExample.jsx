// Example of how to use the LoadingSpinner in your components
// For your Customers.jsx file, replace the loading section with:

import LoadingSpinner from "@/components/LoadingSpinner";

// Then in your JSX where you're checking for loading state:

{
  /* Content */
}
{
  loading ? (
    <div className="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" text="Loading customers..." />
    </div>
  ) : filteredCustomers.length === 0 ? (
    <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg border border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-300">
          No customers found
        </h3>
        <p className="text-gray-500 mt-1">
          Try adjusting your search or filters
        </p>
        <Button
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleAddCustomer}
        >
          Add Your First Customer
        </Button>
      </div>
    </div>
  ) : viewMode === "grid" ? (
    <CustomersList
      customers={filteredCustomers}
      onEdit={handleEditCustomer}
      onDelete={handleDeleteCustomer}
    />
  ) : (
    <CustomersTable
      customers={filteredCustomers}
      onEdit={handleEditCustomer}
      onDelete={handleDeleteCustomer}
    />
  );
}

// For a full-page loading overlay, for example when saving a form:
{
  saving && <LoadingSpinner fullPage={true} text="Saving changes..." />;
}

// Another example for a smaller spinner in a button:
<Button
  className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none"
  onClick={handleSave}
  disabled={saving}
>
  {saving ? (
    <>
      <LoadingSpinner size="sm" color="white" />
      <span className="ml-2">Saving...</span>
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Save
    </>
  )}
</Button>;

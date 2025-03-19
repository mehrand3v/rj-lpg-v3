// Simple Card Component
function Example() {
  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">
      <h3 className="font-medium">Card Title | Example How to use theme classes</h3>
      <p className="text-muted-foreground">Card content goes here</p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded mt-4">
        Action
      </button>
    </div>
  );
}
export default Example;

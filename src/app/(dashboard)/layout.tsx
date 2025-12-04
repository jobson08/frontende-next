const LayoutDashboard = () => {

    return ( 
        <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 bg-red-200">L</div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%]  overflow-scroll flex flex-colbg-blue-200"></div>R</div>
     );
}
 
export default LayoutDashboard;
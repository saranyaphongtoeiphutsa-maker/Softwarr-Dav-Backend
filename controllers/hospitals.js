const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

// @desc(iption)    Get all hospitals
// @route           GET /api/v1/hospitals
// @access          Public
exports.getHospitals = async (req, res, next) =>{
    let query;

    // Copy req.query (Change to Array; 1 index = 1 query)
    const reqQuery = {...req.query};

    // Fields to exclude (We will focus on select & sort specifically in the next part)
    const removeFields = ['select','sort', 'page', 'limit'];

    // Loop over remove fields and delete them from reqQuery (remove whatever that matches in removeFields)
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    // Create Query String
    let queryStr = JSON.stringify(reqQuery);

    // Create Operator ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding Resource
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments'); // Unexecute yet

    // Select Fields
    if(req.query.select){ // If query incldues select
        const fields = req.query.select.split(',').join(' '); // Replace , to space because we use , to split fields in URL path
        query = query.select(fields); // Update Query to Execute
    }
    // Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt'); // Define default Sorting
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;

    try{
        // Pagination (Continue)
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Executing Query
        const hospitals = await query;

        // Pagination Result
        const pagination = {};

        if(endIndex < total){
            pagination.next = {page: page+1, limit};
        }

        if(startIndex > 0){
            pagination.prev={page: page-1, limit};
        }

        res.status(200).json({success: true, count: hospitals.length, pagination, data: hospitals})
    }catch(err){
        res.status(400).json({success: false});
    }
};

// @desc        Get single hospital data from input ID
// @route       GET /api/v1/hospitals/:id
// @access      Public
exports.getHospital = async (req, res, next) =>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: hospital});
    }catch(err){
        res.status(400).json({success: false});
    }
};

// @desc        Create a new hospital
// @route       POST /api/v1/hospitals
// @access      Private (เดี๋ยวจะเรียนกันอีกทีในคาบถัดไป)
exports.createHospital = async (req, res, next) =>{
    // console.log(req.body);
    const hospital = await Hospital.create(req.body);
    res.status(201).json({success: true, data: hospital});
};

// @desc        Update existed hospital
// @route       PUT /api/v1/hospitals/:id
// @access      Private
exports.updateHospital = async (req, res, next) =>{
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        });

        if(!hospital){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: hospital});
    }catch (err){
        res.status(400).json({success: false});
    }
};

// @desc        Delete existed hospital
// @route       DELETE /api/v1/hospitals/:id
// @access      Private
exports.deleteHospital = async(req, res, next) =>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({status: false});
        }

        await Appointment.deleteMany({hospital: req.params.id});
        await Hospital.deleteOne({_id: req.params.id});

        res.status(200).json({success: true, data: {}});
    }catch(err){
        res.status(400).json({success: false});
    }
};
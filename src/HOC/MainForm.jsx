import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { PlusCircle, Trash2, Loader2, CheckCircle2, User, Phone, Linkedin, Mail, Github, Globe, BookOpen, FileText, HelpCircle, Bookmark, MessageSquare, X, Link, Plus, Minus, Instagram, Twitter, Zap, Sparkles, ArrowRight, GripVertical } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Sortable from 'sortablejs' // Add this import

// Add this function at the top of your file, outside of any component
const isValidUrl = (string) => {
    try {
        // If the string doesn't start with a protocol, prepend 'https://'
        const url = string.match(/^https?:\/\//) ? new URL(string) : new URL(`https://${string}`);

        // Check if the hostname has at least one dot and doesn't end with a dot
        const hostname = url.hostname;
        const parts = hostname.split('.');

        // Ensure there are at least two parts and none of them are empty
        if (parts.length < 2 || parts.some(part => part.length === 0)) {
            return false;
        }

        // Check if the last part (TLD) is at least 2 characters long
        if (parts[parts.length - 1].length < 2) {
            return false;
        }

        // Additional check for consecutive dots
        if (hostname.includes('..')) {
            return false;
        }

        return true;
    } catch (_) {
        return false;
    }
}

const generateId = () => '_' + Math.random().toString(36).substr(2, 9); // Function to generate unique IDs

const ProjectCollectorForm = () => {
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('projectCollectorFormData')
        return savedData ? JSON.parse(savedData) : {
            name: '',
            whatsapp: '',
            linkedin: '',
            email: '',
            codebase: '',
            demo: '',
            title: '',
            description: '',
            resources: [{ id: generateId(), remark: '', link: '' }],
            problemStatement: ''
        }
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        localStorage.setItem('projectCollectorFormData', JSON.stringify(formData))
    }, [formData])

    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [showThankYouMessage, setShowThankYouMessage] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updatedData = { ...prev, [name]: value }
            localStorage.setItem('projectCollectorFormData', JSON.stringify(updatedData))
            return updatedData
        })
        validateField(name, value) // Add this line to validate on change
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        validateField(name, value)
    }

    const validateField = (name, value) => {
        let error = ''
        switch (name) {
            case 'whatsapp':
                if (value && !/^\d{10}$/.test(value)) {
                    error = 'Please enter a 10-digit number'
                }
                break
            case 'linkedin':
                if (value && !isValidUrl(value)) {
                    error = 'Please enter a valid URL'
                } else if (value && !value.toLowerCase().includes('linkedin.com')) {
                    error = 'Please enter a valid LinkedIn URL'
                }
                break
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address'
                }
                break
            case 'codebase':
            case 'demo':
                if (value && !isValidUrl(value)) {
                    error = 'Please enter a valid URL'
                }
                break;
            // Add more cases for other fields if needed
        }
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleResourceChange = (id, field, value) => {
        const updatedResources = formData.resources.map(resource => {
            if (resource.id === id) {
                return { ...resource, [field]: value };
            }
            return resource;
        });
        setFormData(prev => ({
            ...prev,
            resources: updatedResources
        }));

        // Validate URL for resource links
        if (field === 'link') {
            const error = isValidUrl(value) ? '' : 'Please enter a valid URL'
            setErrors(prev => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    [id]: { ...prev.resources?.[id], link: error }
                }
            }))
        }
    }

    const addResource = () => {
        setFormData(prev => ({
            ...prev,
            resources: [...prev.resources, { id: generateId(), remark: '', link: '' }]
        }));
    }

    const removeResource = (id) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter(resource => resource.id !== id)
        }));
    }

    const calculateProgress = () => {
        const fields = Object.entries(formData)
        const filledFields = fields.filter(([key, value]) => {
            if (key === 'resources') return value.some(r => r.remark || r.link)
            return value !== ''
        }).length
        return Math.round((filledFields / fields.length) * 100)
    }

    useEffect(() => {
        setProgress(calculateProgress())
    }, [formData])

    const clearForm = () => {
        localStorage.removeItem('projectCollectorFormData')
        setFormData({
            name: '',
            whatsapp: '',
            linkedin: '',
            email: '',
            codebase: '',
            demo: '',
            title: '',
            description: '',
            resources: [{ id: generateId(), remark: '', link: '' }],
            problemStatement: ''
        })
        setErrors({})
        toast({
            title: "Form Cleared",
            description: "All fields have been reset.",
        })
    }

    const clearProjectDetails = () => {
        setFormData(prev => ({
            ...prev,
            codebase: '',
            demo: '',
            title: '',
            description: '',
            resources: [{ id: generateId(), remark: '', link: '' }],
            problemStatement: ''
        }))
        setErrors({})
        toast({
            title: "Project Details Cleared",
            description: "Project-specific fields have been reset.",
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = 'https://script.google.com/macros/s/AKfycbya1Sjm8jyJxrD-qSuP0QL9gOqqlv5ETa-ZAoZ1Z1s_aZ4xDYnp-y_FuuLQTcLbf794/exec';

        try {
            // Filter and format resources correctly as objects with 'remark' and 'link' keys
            const formattedResources = formData.resources
                .filter(resource => resource.remark.trim() || resource.link.trim()) // Keep non-empty entries
                .map(({ remark, link }) => ({ remark, link })); // Keep key-value pairs as objects

            // Prepare the data for submission
            const dataToSend = {
                ...formData,
                resources: JSON.stringify(formattedResources), // Convert to JSON string for sending
            };

            const fetchWithTimeout = (url, options, timeout = 10000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timed out')), timeout)
                    ),
                ]);
            };

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });


            setIsSubmitted(true);
            setShowThankYouMessage(true);
            clearProjectDetails();
            toast({
                title: "Project Submitted!",
                description: "Thank you for sharing your amazing project with us!",
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                title: "Submission Error",
                description: "There was an error submitting your project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sections = [
        { id: 'personal', title: 'Personal Information' },
        { id: 'project', title: 'Project Details' },
        { id: 'resources', title: 'Recommended Resources' }
    ]

    const isFormValid = () => {
        return formData.name && formData.linkedin && formData.email && formData.codebase && formData.title && formData.description && formData.problemStatement
    }

    const ThankYouMessage = ({ onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-75 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full border border-purple-400/30"
            >
                <div className="relative p-8">
                    {/* Wrap the close button in a larger clickable area */}
                    <div className="absolute top-4 right-4">
                        <Button
                            onClick={onClose}
                            className="text-purple-200 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            variant="ghost"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mb-6"
                    >
                        <Sparkles className="h-8 w-8 text-yellow-300" />
                    </motion.div>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl sm:text-3xl font-bold mb-4 text-center text-white font-museomoderno"
                    >
                        Thank You for Contributing!
                    </motion.h2>
                    <motion.div // Changed from <motion.p> to <motion.div>
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-purple-100 text-left mb-6"
                    >
                        <div className="text-purple-50 text-center">
                            Your contribution is invaluable in helping us build a vibrant community of learners and innovators. 🌟
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/10 rounded-2xl p-6 mb-6"
                    >
                        <p className="text-purple-50 text-center">To stay connected and collaborate further, we invite you to join our Discord server! 🤝💬</p>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-center mb-6"
                    >
                        <Button
                            onClick={() => window.open("https://discord.gg/tNXAH4WFKC", "_blank")}
                            className="bg-white text-purple-700 hover:bg-purple-100 font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 group"
                        >
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Join Our Discord
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-center space-x-4"
                    >
                        <p className="text-purple-50 text-center">Let's continue the conversation, share ideas, and support each other on this exciting journey. </p>
                    </motion.div>
                </div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/10 p-4 text-center"
                >
                    <p className="text-purple-100 font-medium">
                        Once again, thank you for being a part of our mission! 🙌💖
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );

    const SocialButton = ({ icon, href }) => (
        <Button
            onClick={() => window.open(href, "_blank")}
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 border-purple-300/30 hover:bg-white/20 hover:border-purple-200/50 transition-colors duration-300 text-purple-100 hover:text-white"
        >
            {icon}
        </Button>
    )

    // Initialize Sortable on the resources list
    useEffect(() => {
        const el = document.getElementById('resources-list');
        const sortable = Sortable.create(el, {
            animation: 150, // Duration of the animation in milliseconds
            ghostClass: 'sortable-ghost', // Class name for the item being dragged
            onEnd: (event) => {
                const updatedResources = Array.from(formData.resources);
                const [movedItem] = updatedResources.splice(event.oldIndex, 1);
                updatedResources.splice(event.newIndex, 0, movedItem);
                setFormData(prev => ({
                    ...prev,
                    resources: updatedResources // Update the state with the new order
                }));
            }
        });

        return () => {
            sortable.destroy(); // Cleanup on unmount
        };
    }, [formData.resources]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8 font-nunito"
        >
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                <Card className="overflow-hidden shadow-2xl rounded-2xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
                        <CardTitle className="text-4xl font-extrabold text-center font-museomoderno">
                            <motion.span
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <span className='text-[#FEF158]'>Taksh </span>
                                Mega Project Collection
                            </motion.span>
                        </CardTitle>
                        <CardDescription className="text-center text-xl mt-2 text-purple-100 font-nunito">
                            <motion.span
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                No project is a small project!
                            </motion.span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Progress value={progress} className="w-full h-2" />
                        </motion.div>

                        {sections.map((section, index) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${progress >= ((index + 1) / sections.length) * 100 ? 'bg-purple-600' : 'bg-purple-200'} transition-colors duration-300`}>
                                        {progress >= ((index + 1) / sections.length) * 100 ? (
                                            <CheckCircle2 className="w-6 h-6 text-white" />) : (
                                            <span className="text-purple-600 font-bold text-lg">{index + 1}</span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-purple-800 font-nunito">{section.title}</h3>
                                </div>

                                {section.id === 'personal' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            icon={<User className="text-purple-500" />}
                                            label="Full Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.name}
                                            required
                                        />
                                        <InputField
                                            icon={<Phone className="text-purple-500" />}
                                            label="WhatsApp Number"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.whatsapp}
                                            pattern="[0-9]{10}"
                                            title="Please enter a 10-digit number"
                                        />
                                        <InputField
                                            icon={<Linkedin className="text-purple-500" />}
                                            label="LinkedIn Profile"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.linkedin}
                                            type="url"
                                            pattern="https://.*linkedin\.com.*"
                                            title="Please enter a valid LinkedIn URL"
                                            required
                                        />
                                        <InputField
                                            icon={<Mail className="text-purple-500" />}
                                            label="Email Address"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.email}
                                            type="email"
                                            required
                                        />
                                    </div>
                                )}

                                {section.id === 'project' && (
                                    <div className="space-y-6">
                                        <InputField
                                            icon={<Github className="text-purple-500" />}
                                            label="Project Link (e.g. GitHub, Drive, etc.)"
                                            name="codebase"
                                            value={formData.codebase}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.codebase}
                                            placeholder="Project link"
                                            required
                                        />
                                        <InputField
                                            icon={<Globe className="text-purple-500" />}
                                            label="Live Demo(if any)"
                                            name="demo"
                                            value={formData.demo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.demo}
                                            placeholder="Deployed project link"
                                        />
                                        <InputField
                                            icon={<BookOpen className="text-purple-500" />}
                                            label="Project Title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.title}
                                            required
                                            placeholder="Specific Short and Exact Title of the Project"
                                        />
                                        <TextareaField
                                            icon={<FileText className="text-purple-500" />}
                                            label="Project Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.description}
                                            required
                                            placeholder="What have you built exactly?"
                                        />
                                        <TextareaField
                                            icon={<HelpCircle className="text-purple-500" />}
                                            label="What is the purpose of this project?"
                                            name="problemStatement"
                                            value={formData.problemStatement}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.problemStatement}
                                            required
                                            placeholder="Why this project?"
                                        />
                                    </div>
                                )}

                                {section.id === 'resources' && (
                                    <div className="space-y-6">
                                        <div className='bg-purple-100 rounded-md p-2 text-purple-800 text-center text-sm align-middle flex items-center justify-center font-semibold'> Share the resources you used to build this project</div>
                                        <div id="resources-list" className="space-y-4">
                                            {formData.resources.map((resource) => (
                                                <ResourceCard
                                                    key={resource.id} // Use unique ID as key
                                                    resource={resource}
                                                    handleResourceChange={handleResourceChange}
                                                    removeResource={removeResource}
                                                    errors={errors}
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addResource}
                                            className="w-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-300"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Resource
                                        </Button>
                                    </div>
                                )}

                                {index < sections.length - 1 && <Separator className="my-8" />}
                            </motion.div>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-gray-50 px-8 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" className="w-full sm:w-auto">Clear All Fields</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg mx-auto">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all the data you've entered in the form.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearForm} className="w-full sm:w-auto">Yes, clear all fields</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isFormValid()}
                            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Project'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            <AnimatePresence>
                {showThankYouMessage && (
                    <ThankYouMessage onClose={() => setShowThankYouMessage(false)} />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const InputField = ({ icon, label, name, error, required, ...props }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center font-nunito">
            {icon}
            <span className="ml-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </span>
        </Label>
        <Input
            id={name}
            name={name}
            className={`w-full font-nunito ${error ? 'border-red-500' : ''}`}
            {...props}
        />
        {error && <p className="text-red-500 text-sm font-nunito">{error}</p>}
    </div>
)

const TextareaField = ({ icon, label, name, error, required, ...props }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center font-nunito">
            {icon}
            <span className="ml-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </span>
        </Label>
        <Textarea id={name} name={name} className="w-full font-nunito" {...props} />
        {error && <p className="text-red-500 text-sm font-nunito">{error}</p>}
    </div>
)

const ResourceCard = ({ resource, handleResourceChange, removeResource, errors }) => (
    <Card className="bg-purple-50 border-purple-200 relative">
        {/* Header */}
        <CardHeader className="pb-2 flex items-center justify-between">
            {/* Left Section: Grip Icon + Title aligned to top-left */}
            <div className="flex items-center space-x-2 absolute top-2 left-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-purple-500 hover:text-purple-700 p-1"
                >
                    <GripVertical className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg font-semibold text-purple-700">
                    Resource
                </CardTitle>
            </div>

            {/* Delete Button at top-right corner */}
            <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => removeResource(resource.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 h-auto absolute top-2 right-2"
            >
                <Minus className="h-5 w-5" />
            </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="mt-12 space-y-4">
            {/* Description Field */}
            <div className="space-y-2">
                <Label htmlFor={`resource-desc-${resource.id}`} className="text-sm font-medium text-purple-600">
                    Description
                </Label>
                <Input
                    id={`resource-desc-${resource.id}`}
                    placeholder="e.g., Official Documentation"
                    value={resource.remark}
                    onChange={(e) => handleResourceChange(resource.id, 'remark', e.target.value)}
                    className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
            </div>

            {/* Link Field */}
            <div className="space-y-2">
                <Label htmlFor={`resource-link-${resource.id}`} className="text-sm font-medium text-purple-600">
                    Link
                </Label>
                <div className="relative">
                    <Input
                        id={`resource-link-${resource.id}`}
                        placeholder="https://example.com"
                        value={resource.link}
                        onChange={(e) => handleResourceChange(resource.id, 'link', e.target.value)}
                        className={`bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 pl-10 ${errors?.resources?.[resource.id]?.link ? 'border-red-500' : ''
                            }`}
                    />
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                </div>
                {errors?.resources?.[resource.id]?.link && (
                    <p className="text-red-500 text-sm">{errors.resources[resource.id].link}</p>
                )}
            </div>
        </CardContent>
    </Card>
);

export default ProjectCollectorForm
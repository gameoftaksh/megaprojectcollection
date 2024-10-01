import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { PlusCircle, Trash2, Loader2, CheckCircle2, User, Phone, Linkedin, Mail, Github, Globe, BookOpen, FileText, HelpCircle, Bookmark } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
            resources: [{ remark: '', link: '' }],
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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updatedData = { ...prev, [name]: value }
            localStorage.setItem('projectCollectorFormData', JSON.stringify(updatedData))
            return updatedData
        })
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        validateField(name, value)
    }

    const validateField = (name, value) => {
        let error = ''
        if (name === 'whatsapp' && value && !/^\d{10}$/.test(value)) {
            error = 'Please enter a 10-digit number'
        } else if (name === 'linkedin' && value && !/^https:\/\/.*linkedin\.com.*$/.test(value)) {
            error = 'Please enter a valid LinkedIn URL'
        } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Please enter a valid email address'
        }
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleResourceChange = (index, field, value) => {
        const updatedResources = [...formData.resources]
        updatedResources[index][field] = value
        setFormData(prev => {
            const updatedData = { ...prev, resources: updatedResources }
            localStorage.setItem('projectCollectorFormData', JSON.stringify(updatedData))
            return updatedData
        })
    }

    const addResource = () => {
        setFormData(prev => {
            const updatedData = {
                ...prev,
                resources: [...prev.resources, { remark: '', link: '' }]
            }
            localStorage.setItem('projectCollectorFormData', JSON.stringify(updatedData))
            return updatedData
        })
    }

    const removeResource = (index) => {
        setFormData(prev => {
            const updatedResources = prev.resources.filter((_, i) => i !== index)
            const updatedData = { ...prev, resources: updatedResources }
            localStorage.setItem('projectCollectorFormData', JSON.stringify(updatedData))
            return updatedData
        })
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
            resources: [{ remark: '', link: '' }],
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
            resources: [{ remark: '', link: '' }],
            problemStatement: ''
        }))
        setErrors({})
        toast({
            title: "Project Details Cleared",
            description: "Project-specific fields have been reset.",
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const url = 'https://script.google.com/macros/s/AKfycbya1Sjm8jyJxrD-qSuP0QL9gOqqlv5ETa-ZAoZ1Z1s_aZ4xDYnp-y_FuuLQTcLbf794/exec'

        try {
            // Prepare the data in the format expected by the Google Apps Script
            const dataToSend = {
                ...formData,
                resources: JSON.stringify(formData.resources)
            };

            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            })

            console.log('Response received:', response);

            // Since we can't read the response in 'no-cors' mode, we'll assume success if no error was thrown
            clearProjectDetails()
            toast({
                title: "Project Submitted!",
                description: "Thank you for sharing your amazing project with us!",
            })
        } catch (error) {
            console.error('Error submitting form:', error)
            toast({
                title: "Submission Error",
                description: "There was an error submitting your project. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const sections = [
        { id: 'personal', title: 'Personal Information' },
        { id: 'project', title: 'Project Details' },
        { id: 'resources', title: 'Recommended Resources' }
    ]

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
                                Share your amazing project and inspire others!
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
                                            label="WhatsApp Number (Optional)"
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
                                            label="Project Codebase (GitHub Link)"
                                            name="codebase"
                                            value={formData.codebase}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.codebase}
                                            placeholder="GitHub repository link"
                                            required
                                        />
                                        <InputField
                                            icon={<Globe className="text-purple-500" />}
                                            label="Live Demo (Optional)"
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
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-purple-800 flex items-center font-nunito">
                                            <Bookmark className="mr-2 text-purple-500" />
                                            Recommended Resources
                                        </Label>
                                        <AnimatePresence>
                                            {formData.resources.map((resource, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex space-x-2 mt-2"
                                                >
                                                    <Input
                                                        placeholder="Resource Description"
                                                        value={resource.remark}
                                                        onChange={(e) => handleResourceChange(index, 'remark', e.target.value)}
                                                        className="flex-grow font-nunito"
                                                    />
                                                    <Input
                                                        placeholder="Resource Link"
                                                        value={resource.link}
                                                        onChange={(e) => handleResourceChange(index, 'link', e.target.value)}
                                                        className="flex-grow font-nunito"
                                                    />
                                                    {index > 0 && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeResource(index)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Remove resource</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <Button type="button" variant="outline" onClick={addResource} className="mt-2">
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
                                        </Button>
                                    </div>
                                )}

                                {index < sections.length - 1 && <Separator className="my-8" />}
                            </motion.div>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-gray-50 px-8 py-4 flex justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive">Clear All Fields</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all the data you've entered in the form.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearForm}>Yes, clear all fields</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
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
        </motion.div>
    )
}

const InputField = ({ icon, label, name, error, ...props }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center font-nunito">
            {icon}
            <span className="ml-2">{label}</span>
        </Label>
        <Input id={name} name={name} className="w-full font-nunito" {...props} />
        {error && <p className="text-red-500 text-sm font-nunito">{error}</p>}
    </div>
)

const TextareaField = ({ icon, label, name, error, ...props }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center font-nunito">
            {icon}
            <span className="ml-2">{label}</span>
        </Label>
        <Textarea id={name} name={name} className="w-full font-nunito" {...props} />
        {error && <p className="text-red-500 text-sm font-nunito">{error}</p>}
    </div>
)

export default ProjectCollectorForm
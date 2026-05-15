"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Plus, UserPlus, Wallet, CalendarDays, FileText, Loader2 } from "lucide-react"

const formSchema = z.object({
  person_name: z.string().min(2, "Person name is required"),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["to_receive", "to_pay"]),
  due_date: z.string().optional(),
  note: z.string().optional(),
})

interface AddDebtModalProps {
  children?: React.ReactNode
  onDebtAdded?: () => void
}

export function AddDebtModal({ children, onDebtAdded }: AddDebtModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "to_receive",
      person_name: "",
      amount: "",
      note: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await (supabase.from('debts') as any)
        .insert({
          ...values,
          user_id: user.id,
          amount: Number(values.amount)
        })

      if (error) throw error

      toast.success("Record added successfully")
      setOpen(false)
      form.reset()
      onDebtAdded?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to add record")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Brute-force cast to any to bypass Vercel build error on asChild */}
      <DialogTrigger asChild={true as any}>
        {children || (
          <Button className="rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-widest gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none max-w-lg shadow-2xl">
        <div className="bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <DialogHeader className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-white">Naya Debt / Credit</DialogTitle>
            <p className="text-white/70 text-sm font-medium">Add a new debt or credit entry to your ledger.</p>
          </DialogHeader>
        </div>

        <div className="p-8 bg-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-12 font-bold border-muted bg-muted/30">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="to_receive" className="font-bold text-emerald-600">Lene Hain (Receive)</SelectItem>
                          <SelectItem value="to_pay" className="font-bold text-rose-600">Dene Hain (Pay)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="rounded-xl h-12 pl-11 font-black text-lg bg-muted/30 border-muted" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Person Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Ramesh Bhai" 
                        className="rounded-xl h-12 font-bold bg-muted/30 border-muted" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="rounded-xl h-12 pl-11 font-bold bg-muted/30 border-muted" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note / Vivaran</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="e.g. Purana hisab" 
                            className="rounded-xl h-12 pl-11 font-bold bg-muted/30 border-muted" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all mt-4"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Add Record to Khata"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

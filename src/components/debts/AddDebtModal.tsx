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
  debt?: any
}

// @ts-ignore - Brute-force cast to any for Vercel stability
const DT: any = DialogTrigger

export function AddDebtModal({ children, onDebtAdded, debt }: AddDebtModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isEditing = !!debt

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: debt?.type || "to_receive",
      person_name: debt?.person_name || "",
      amount: debt?.amount?.toString() || "",
      note: debt?.note || "",
      due_date: debt?.due_date || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isEditing) {
        const { error } = await supabase.from('debts')
          .update({
            ...values,
            amount: Number(values.amount)
          })
          .eq('id', debt.id)

        if (error) throw error
        toast.success("Record updated successfully")
      } else {
        const { error } = await supabase.from('debts')
          .insert({
            ...values,
            user_id: user.id,
            amount: Number(values.amount)
          })

        if (error) throw error
        toast.success("Record added successfully")
      }

      setOpen(false)
      if (!isEditing) form.reset()
      onDebtAdded?.()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'add'} record`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DT asChild>
        {children || (
          <Button className="rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-widest gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        )}
      </DT>
      <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none max-w-lg shadow-2xl bg-transparent">
        <div className="bg-primary p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <DialogHeader className="relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md shadow-xl border border-white/20">
              {isEditing ? <FileText className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
            </div>
            <DialogTitle className="text-4xl font-black tracking-tight text-white">
              {isEditing ? 'Edit Record' : 'Naya Khata'}
            </DialogTitle>
            <p className="text-white/70 text-sm font-medium mt-2">
              {isEditing ? 'Modify your existing debt/credit entry.' : 'Add a new debt or credit entry to your ledger.'}
            </p>
          </DialogHeader>
        </div>

        <div className="p-10 bg-card/95 backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Transaction Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl h-14 font-bold border-none bg-muted/50 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          <SelectItem value="to_receive" className="font-bold text-emerald-600 focus:bg-emerald-50">Lene Hain (Receive)</SelectItem>
                          <SelectItem value="to_pay" className="font-bold text-rose-600 focus:bg-rose-50">Dene Hain (Pay)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Amount (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-primary/10 rounded-lg">
                            <Wallet className="w-3 h-3 text-primary" />
                          </div>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="rounded-2xl h-14 pl-14 font-black text-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Person Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-primary/10 rounded-lg">
                          <UserPlus className="w-3 h-3 text-primary" />
                        </div>
                        <Input 
                          placeholder="e.g. Ramesh Bhai" 
                          className="rounded-2xl h-14 pl-14 font-bold bg-muted/50 border-none focus:ring-2 focus:ring-primary/20" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-rose-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Due Date (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-primary/10 rounded-lg">
                            <CalendarDays className="w-3 h-3 text-primary" />
                          </div>
                          <Input 
                            type="date" 
                            className="rounded-2xl h-14 pl-14 font-bold bg-muted/50 border-none focus:ring-2 focus:ring-primary/20" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Note / Vivaran</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-primary/10 rounded-lg">
                            <FileText className="w-3 h-3 text-primary" />
                          </div>
                          <Input 
                            placeholder="e.g. Purana hisab" 
                            className="rounded-2xl h-14 pl-14 font-bold bg-muted/50 border-none focus:ring-2 focus:ring-primary/20" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all mt-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:scale-105 transition-transform" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isEditing ? 'Update Record' : 'Save to Khata'}
                      <Wallet className="w-5 h-5" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
